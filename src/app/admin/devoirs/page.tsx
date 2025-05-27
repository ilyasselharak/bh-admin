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
        const response = await fetch(
          `/api/devoirs?level=${filters.level}&grade=${filters.grade}&semester=${filters.semester}`
        );
        if (!response.ok) throw new Error("Failed to fetch devoirs");
        const data = await response.json();
        setDevoirs(data);
      } catch (err) {
        setError("Error loading devoirs");
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
          level: filters.level,
          grade: filters.grade,
        }),
      });

      if (!response.ok) throw new Error("Failed to save devoir");

      const savedDevoir = await response.json();

      if (editingDevoir) {
        setDevoirs(
          devoirs.map((d) => (d._id === editingDevoir._id ? savedDevoir : d))
        );
      } else {
        setDevoirs([...devoirs, savedDevoir]);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError("Error saving devoir");
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
            <option value="">All Levels</option>
            <option value="college">College</option>
            <option value="lycee">Lycee</option>
          </select>

          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!filters.level}
          >
            <option value="">All Grades</option>
            {filters.level === "college" && (
              <>
                <option value="1">First College</option>
                <option value="2">Second College</option>
                <option value="3">Third College</option>
              </>
            )}
            {filters.level === "lycee" && (
              <>
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="2bac_math">2Bac Math</option>
                <option value="2bac_eco">2Bac Economics</option>
                <option value="2bac_pc">2Bac Physics</option>
                <option value="2bac_tct">2Bac Technical</option>
                <option value="tct">Technical</option>
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
                        <option value="math">Math</option>
                        <option value="science">Science</option>
                        <option value="2bac_math">2Bac Math</option>
                        <option value="2bac_eco">2Bac Economics</option>
                        <option value="2bac_pc">2Bac Physics</option>
                        <option value="2bac_tct">2Bac Technical</option>
                        <option value="tct">Technical</option>
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
