"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";

interface Course {
  _id: string;
  name: string;
  courseLink: string;
  exerciseLink: string;
  level: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
}
interface MediaData {
  url: string;
  type?: string;
}

interface MediaResolver {
  html: string;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
}
export default function CoursesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    grade: "",
  });
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editedUrls, setEditedUrls] = useState("");
  const [editedExerciseUrls, setEditedExerciseUrls] = useState("");
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.level) queryParams.append("level", filters.level);
        if (filters.grade) queryParams.append("grade", filters.grade);

        const response = await fetch(
          `/api/courses/all?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError("Error loading courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchCourses();
    }
  }, [status, filters]);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setEditedUrls(course.courseLink);
    setIsModalOpen(true);
  };

  const handleExerciseEdit = (course: Course) => {
    setEditingCourse(course);
    setEditedExerciseUrls(course.exerciseLink);
    setIsExerciseModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/courses/${editingCourse._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseLink: editedUrls,
        }),
      });

      if (!response.ok) throw new Error("Failed to update course");

      // Update the course in the local state
      setCourses(
        courses.map((course) =>
          course._id === editingCourse._id
            ? { ...course, courseLink: editedUrls }
            : course
        )
      );

      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      setError("Error updating course");
      console.error(err);
    }
  };

  const handleExerciseSave = async () => {
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/courses/${editingCourse._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseLink: editedExerciseUrls,
        }),
      });

      if (!response.ok) throw new Error("Failed to update exercise");

      // Update the course in the local state
      setCourses(
        courses.map((course) =>
          course._id === editingCourse._id
            ? { ...course, exerciseLink: editedExerciseUrls }
            : course
        )
      );

      setIsExerciseModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      setError("Error updating exercise");
      console.error(err);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete course");

      // Remove the course from the local state
      setCourses(courses.filter((course) => course._id !== courseId));
    } catch (err) {
      setError("Error deleting course");
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getGradeOptions = () => {
    if (filters.level === "college") {
      return ["1", "2", "3"];
    } else if (filters.level === "lycee") {
      return [
        "math",
        "science",
        "2bac_math",
        "2bac_eco",
        "2bac_pc",
        "2bac_tct",
        "tct",
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-indigo-900 text-center">
          Courses Management
        </h1>

        {/* Filters */}
        <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-full sm:w-48"
          >
            <option value="">All Levels</option>
            <option value="college">College</option>
            <option value="lycee">Lycee</option>
          </select>

          <select
            name="grade"
            value={filters.grade}
            onChange={handleFilterChange}
            className="p-3 border-2 border-indigo-200 rounded-lg bg-white text-indigo-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-full sm:w-48 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!filters.level}
          >
            <option value="">All Grades</option>
            {getGradeOptions().map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-indigo-600 text-lg">
            Loading courses...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-indigo-900">
                  {course.name}
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Level:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {course.level}
                    </span>
                  </p>
                  <p className="flex items-center text-indigo-700">
                    <span className="font-medium mr-2">Grade:</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                      {course.grade}
                    </span>
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 text-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Edit Course Links
                    </button>
                    <button
                      onClick={() => handleExerciseEdit(course)}
                      className="flex-1 text-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Edit Exercise Links
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
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

        {!loading && courses.length === 0 && (
          <div className="text-center text-indigo-600 mt-12 text-lg">
            No courses found matching the current filters.
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                Edit Course Links - {editingCourse.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter URLs separated by &quot;,,&quot; (double comma)
              </p>
              {/* <textarea
                value={editedUrls}
                onChange={(e) => setEditedUrls(e.target.value)}
                className="w-full h-48 p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-black"
                placeholder="Enter URLs separated by ,,"
              /> */}
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                value={editedUrls}
                onEditorChange={(newValue) => {
                  setEditedUrls(newValue);
                }}
                init={editorConfig}
              />
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

        {/* Exercise Edit Modal */}
        {isExerciseModalOpen && editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                Edit Exercise Links - {editingCourse.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter URLs separated by &quot;,,&quot; (double comma)
              </p>
             
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                value={editedExerciseUrls}
                onEditorChange={(newValue) => {
                  setEditedExerciseUrls(newValue);
                }}
                init={editorConfig}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsExerciseModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExerciseSave}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
