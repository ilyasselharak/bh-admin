"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";

interface Devoir {
  _id: string;
  title: string;
  content: string;
  semester: number;
  level: string;
  grade: string;
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
export default function DevoirsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    grade: "",
    semester: "1",
  });

  // Model mapping for devoirs
  const getDevoirModel = (level: string, grade: string) => {
    const modelMap: { [key: string]: { [key: string]: string } } = {
      college: {
        "1": "FirstCollegeDevoir",
        "2": "SecondCollegeDevoir", 
        "3": "ThirdCollegeDevoir"
      },
      lycee: {
        "1bac_math": "FirstBacMathDevoir",
        "1bac_science": "FirstBacScienceDevoir",
        "1bac_economics": "FirstBacEconomicsDevoir",
        "1bac_letters": "FirstBacLettersDevoir",
        "2bac_math_a": "SecondBacMathADevoir",
        "2bac_math_b": "SecondBacMathBDevoir",
        "2bac_economics": "SecondBacEconomicsDevoir",
        "2bac_letters": "SecondBacLettersDevoir",
        "2bac_pcsvt": "SecondBacPhysicsChemistryLifeSciencesDevoir",
        "2bac_tct": "SecondBacTechnicalCommonDevoir"
      },
      common_core: {
        "letters": "CommonCoreLettersDevoir",
        "science": "CommonCoreScienceDevoir",
        "technical": "CommonCoreTechnicalDevoir"
      }
    };
    
    return modelMap[level]?.[grade] || null;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevoir, setEditingDevoir] = useState<Devoir | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [semester, setSemester] = useState(1);

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
    const fetchDevoirs = async () => {
      try {
        setLoading(true);
        if (!filters.level || !filters.grade) {
          setDevoirs([]);
          setLoading(false);
          return;
        }

        const modelName = getDevoirModel(filters.level, filters.grade);
        if (!modelName) {
          setDevoirs([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/devoirs?model=${modelName}&semester=${filters.semester}`
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch devoirs");
        }
        const data = await response.json();
        setDevoirs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading devoirs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDevoirs();
    }
  }, [status, filters]);

  const handleAddNew = () => {
    setEditingDevoir(null);
    setTitle("");
    setContent("");
    setSemester(1);
    setIsModalOpen(true);
  };

  const handleEdit = (devoir: Devoir) => {
    setEditingDevoir(devoir);
    setTitle(devoir.title);
    setContent(devoir.content);
    setSemester(devoir.semester);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!filters.level || !filters.grade) {
        setError("Please select a level and grade");
        return;
      }

      const modelName = getDevoirModel(filters.level, filters.grade);
      if (!modelName) {
        setError("Invalid level and grade combination");
        return;
      }

      const url = editingDevoir
        ? `/api/devoirs/${editingDevoir._id}`
        : "/api/devoirs";
      const method = editingDevoir ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          semester,
          model: modelName,
          level: filters.level,
          grade: filters.grade,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save devoir");
      }

      const savedDevoir = await response.json();

      if (editingDevoir) {
        setDevoirs(
          devoirs.map((d) => (d._id === editingDevoir._id ? savedDevoir : d))
        );
      } else {
        setDevoirs([savedDevoir, ...devoirs]);
      }

      setIsModalOpen(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving devoir");
      console.error(err);
    }
  };

  const handleDelete = async (devoirId: string) => {
    if (!confirm("Are you sure you want to delete this devoir?")) {
      return;
    }

    try {
      const response = await fetch(`/api/devoirs/${devoirId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete devoir");

      setDevoirs(devoirs.filter((d) => d._id !== devoirId));
    } catch (err) {
      setError("Error deleting devoir");
      console.error(err);
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
            Devoirs Management
          </h1>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Add New Devoir
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={filters.level}
            onChange={(e) =>
              setFilters({ ...filters, level: e.target.value, grade: "" })
            }
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          >
            <option value="">Select Level</option>
            <option value="college">College</option>
            <option value="lycee">Lycee</option>
            <option value="common_core">Common Core</option>
          </select>

          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!filters.level}
          >
            <option value="">Select Grade</option>
            {filters.level === "college" && (
              <>
                <option value="1">First College</option>
                <option value="2">Second College</option>
                <option value="3">Third College</option>
              </>
            )}
            {filters.level === "lycee" && (
              <>
                <option value="1bac_math">First Bac Math</option>
                <option value="1bac_science">First Bac Science</option>
                <option value="1bac_economics">First Bac Economics</option>
                <option value="1bac_letters">First Bac Letters</option>
                <option value="2bac_math_a">Second Bac Math A</option>
                <option value="2bac_math_b">Second Bac Math B</option>
                <option value="2bac_physics">Second Bac Physics</option>
                <option value="2bac_economics">Second Bac Economics</option>
                <option value="2bac_technical">Second Bac Technical</option>
                <option value="2bac_letters">Second Bac Letters</option>
                <option value="2bac_pcsvt">
                  Second Bac Physics Chemistry Life Sciences
                </option>
                <option value="2bac_tct">Second Bac Technical Common</option>
              </>
            )}
            {filters.level === "common_core" && (
              <>
                <option value="letters">Common Core Letters</option>
                <option value="science">Common Core Science</option>
                <option value="technical">Common Core Technical</option>
              </>
            )}
          </select>

          <select
            value={filters.semester}
            onChange={(e) =>
              setFilters({ ...filters, semester: e.target.value })
            }
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-indigo-600 text-lg">
            Loading devoirs...
          </div>
        ) : !filters.grade ? (
          <div className="text-center text-indigo-600 text-lg">
            Please select a level and grade to view devoirs
          </div>
        ) : devoirs.length === 0 ? (
          <div className="text-center text-indigo-600 text-lg">
            No devoirs found for the selected criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {devoirs.map((devoir) => (
              <div
                key={devoir._id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-indigo-900">
                  {devoir.title}
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Level:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {devoir.level}
                    </span>
                  </p>
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Grade:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {devoir.grade}
                    </span>
                  </p>
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Semester:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {devoir.semester}
                    </span>
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleEdit(devoir)}
                      className="flex-1 text-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(devoir._id)}
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
          <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white overflow-scroll h-[500px] rounded-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                {editingDevoir ? "Edit Devoir" : "Add New Devoir"}
              </h2>
              <div className="space-y-4">
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
                    Level
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        level: e.target.value,
                        grade: "",
                      })
                    }
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value="">Select Level</option>
                    <option value="college">College</option>
                    <option value="lycee">Lycee</option>
                    <option value="common_core">Common Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={filters.grade}
                    onChange={(e) =>
                      setFilters({ ...filters, grade: e.target.value })
                    }
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!filters.level}
                  >
                    <option value="">Select Grade</option>
                    {filters.level === "college" && (
                      <>
                        <option value="1">First College</option>
                        <option value="2">Second College</option>
                        <option value="3">Third College</option>
                      </>
                    )}
                    {filters.level === "lycee" && (
                      <>
                        <option value="1bac_math">First Bac Math</option>
                        <option value="1bac_science">First Bac Science</option>
                        <option value="1bac_economics">
                          First Bac Economics
                        </option>
                        <option value="1bac_letters">First Bac Letters</option>
                        <option value="2bac_math_a">Second Bac Math A</option>
                        <option value="2bac_math_b">Second Bac Math B</option>
                        <option value="2bac_physics">Second Bac Physics</option>
                        <option value="2bac_economics">
                          Second Bac Economics
                        </option>
                        <option value="2bac_technical">
                          Second Bac Technical
                        </option>
                        <option value="2bac_letters">Second Bac Letters</option>
                        <option value="2bac_pcsvt">
                          Second Bac Physics Chemistry Life Sciences
                        </option>
                        <option value="2bac_tct">
                          Second Bac Technical Common
                        </option>
                      </>
                    )}
                    {filters.level === "common_core" && (
                      <>
                        <option value="letters">Common Core Letters</option>
                        <option value="science">Common Core Science</option>
                        <option value="technical">Common Core Technical</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
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
