"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";

interface Exam {
  _id: string;
  title: string;
  year: number;
  pdfUrl: string;
  content: string;
  solutionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
}

interface MediaData {
  url: string;
  type?: string;
}

interface MediaResolver {
  html: string;
}

export default function ExamsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    grade: "",
  });

  // Model mapping for exams
  const getExamModel = (grade: string) => {
    const modelMap: { [key: string]: string } = {
      "2bac_economics": "SecondBacEconomicsExam",
      "2bac_letters": "SecondBacLettersExam",
      "2bac_math_a": "SecondBacMathAExam",
      "2bac_math_b": "SecondBacMathBExam",
      "2bac_tech": "SecondBacTechExam",
      "2bac_pcsvt": "SecondBacPCSVTExam",
    };

    return modelMap[grade] || null;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [content, setContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [solutionUrl, setSolutionUrl] = useState("");

  const editorConfig = {
    height: 500,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "media",
      "charmap",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "table",
      "preview",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | " +
      "bold italic forecolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "image media | removeformat | help",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
    images_upload_url: "/api/upload",
    images_upload_handler: async (blobInfo: BlobInfo) => {
      try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload file");
      }
    },
    automatic_uploads: true,
    file_picker_types: "image media file",
    images_reuse_filename: true,
    images_upload_base_path: "/uploads",
    media_live_embeds: true,
    media_url_resolver: function (
      data: MediaData,
      resolve: (result: MediaResolver) => void
    ) {
      if (data.url.toLowerCase().includes("drive.google")) {
        resolve({
          html: `<iframe src="${data.url}" width="100%" height="500px" style="border: none;"></iframe>`,
        });
      } else {
        resolve({
          html: `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`,
        });
      }
    },
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        if (!filters.grade) {
          setExams([]);
          setLoading(false);
          return;
        }

        const modelName = getExamModel(filters.grade);
        if (!modelName) {
          setExams([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/exams?model=${modelName}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch exams");
        }
        const data = await response.json();
        setExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading exams");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchExams();
    }
  }, [status, filters]);

  const handleAddNew = () => {
    setEditingExam(null);
    setTitle("");
    setYear(new Date().getFullYear());
    setContent("");
    setPdfUrl("");
    setSolutionUrl("");
    setIsModalOpen(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setYear(exam.year);
    setContent(exam.content);
    setPdfUrl(exam.pdfUrl);
    setSolutionUrl(exam.solutionUrl || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!filters.grade) {
        setError("Please select a grade");
        return;
      }

      const modelName = getExamModel(filters.grade);
      if (!modelName) {
        setError("Invalid grade");
        return;
      }

      const url = editingExam
        ? `/api/exams/${editingExam._id}`
        : "/api/exams";
      const method = editingExam ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          year,
          pdfUrl: pdfUrl.trim(),
          content,
          solutionUrl: solutionUrl.trim() || undefined,
          type: filters.grade,
          model: modelName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save exam");
      }

      const savedExam = await response.json();

      if (editingExam) {
        setExams(exams.map((e) => (e._id === editingExam._id ? savedExam : e)));
      } else {
        setExams([savedExam, ...exams]);
      }

      setIsModalOpen(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving exam");
      console.error(err);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete exam");
      }

      // Remove the exam from the local state
      setExams(exams.filter((e) => e._id !== examId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting exam";
      setError(errorMessage);
      console.error("Delete error:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-pulse text-indigo-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900">
            Exams Management
          </h1>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Add New Exam
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          >
            <option value="">Select Grade</option>
            <option value="2bac_economics">Second Bac Economics</option>
            <option value="2bac_letters">Second Bac Letters</option>
            <option value="2bac_math_a">Second Bac Math A</option>
            <option value="2bac_math_b">Second Bac Math B</option>
            <option value="2bac_tech">Second Bac Technical</option>
            <option value="2bac_pcsvt">Second Bac Physics Chemistry Life Sciences</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-indigo-600 text-lg">
            Loading exams...
          </div>
        ) : !filters.grade ? (
          <div className="text-center text-indigo-600 text-lg">
            Please select a grade to view exams
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center text-indigo-600 text-lg">
            No exams found for the selected grade
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-indigo-900">
                  {exam.title}
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Year:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {exam.year}
                    </span>
                  </p>
                  {exam.solutionUrl && (
                    <p className="flex items-center text-indigo-700">
                      <span className="font-medium mr-2">Has Solution:</span>
                      <span className="px-2 py-1 bg-green-100 rounded-full text-green-800">
                        Yes
                      </span>
                    </p>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="flex-1 text-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white overflow-scroll max-h-[90vh] rounded-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                {editingExam ? "Edit Exam" : "Add New Exam"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={filters.grade}
                    onChange={(e) =>
                      setFilters({ ...filters, grade: e.target.value })
                    }
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value="">Select Grade</option>
                    <option value="2bac_economics">Second Bac Economics</option>
                    <option value="2bac_letters">Second Bac Letters</option>
                    <option value="2bac_math_a">Second Bac Math A</option>
                    <option value="2bac_math_b">Second Bac Math B</option>
                    <option value="2bac_tech">Second Bac Technical</option>
                    <option value="2bac_pcsvt">Second Bac Physics Chemistry Life Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    min="2000"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PDF URL
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="https://example.com/exam.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solution URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={solutionUrl}
                    onChange={(e) => setSolutionUrl(e.target.value)}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="https://example.com/solution.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    value={content}
                    onEditorChange={(newValue) => {
                      setContent(newValue);
                    }}
                    init={editorConfig}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

