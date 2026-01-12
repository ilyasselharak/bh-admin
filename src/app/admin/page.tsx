"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [exerciseLink, setExerciseLink] = useState("");
  const [devoirLink, setDevoirLink] = useState("");
  const [examenLink, setExamenLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          name: courseName,
          courseLink,
          exerciseLink,
          devoirLink,
          examenLink,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Course added successfully!" });
        // Reset form
        setCourseName("");
        setCourseLink("");
        setExerciseLink("");
        setDevoirLink("");
        setExamenLink("");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to add course",
        });
      }
    } catch (err) {
      console.error("Error adding course:", err);
      setMessage({
        type: "error",
        text: "An error occurred while adding the course",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {session?.user?.name}
              </span>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Add Course Form */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Course
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Model
                  </label>
                  <select
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a model</option>
                    <optgroup label="College">
                      <option value="FirstCollegeCourse">First College</option>
                      <option value="SecondCollegeCourse">
                        Second College
                      </option>
                      <option value="ThirdCollegeCourse">Third College</option>
                    </optgroup>
                    <optgroup label="First Bac">
                      <option value="FirstBacMathCourse">Math</option>
                      <option value="FirstBacScienceCourse">Science</option>
                      <option value="FirstBacEconomicsCourse">Economics</option>
                      <option value="FirstBacLettersCourse">Letters</option>
                    </optgroup>
                    <optgroup label="Second Bac">
                      <option value="SecondBacMathACourse">Math A</option>
                      <option value="SecondBacMathBCourse">Math B</option>
                      <option value="SecondBacLettersCourse">Letters</option>
                      <option value="SecondBacPhysicsChemistryLifeSciencesCourse">
                        Physics Chemistry Life Sciences
                      </option>
                      <option value="SecondBacTechnicalCommonCourse">
                        Technical Common
                      </option>
                      <option value="SecondBacEconomicsCourse">
                        Economics
                      </option>
                    </optgroup>
                    <optgroup label="Common Core">
                      <option value="CommonCoreCourse">General</option>
                      <option value="CommonCoreLettersCourse">Letters</option>
                      <option value="CommonCoreScienceCourse">Science</option>
                      <option value="CommonCoreTechnicalCourse">
                        Technical
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="mt-1 text-gray-700 px-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="courseLink"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Link
                  </label>
                  <input
                    type="url"
                    id="courseLink"
                    value={courseLink}
                    onChange={(e) => setCourseLink(e.target.value)}
                    className="mt-1 text-gray-700 px-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="exerciseLink"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Exercise Link
                  </label>
                  <input
                    type="url"
                    id="exerciseLink"
                    value={exerciseLink}
                    onChange={(e) => setExerciseLink(e.target.value)}
                    className="mt-1 text-gray-700 px-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="devoirLink"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Devoir Link
                  </label>
                  <input
                    type="url"
                    id="devoirLink"
                    value={devoirLink}
                    onChange={(e) => setDevoirLink(e.target.value)}
                    className="mt-1 text-gray-700 px-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="examenLink"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Examen Link
                  </label>
                  <input
                    type="url"
                    id="examenLink"
                    value={examenLink}
                    onChange={(e) => setExamenLink(e.target.value)}
                    className="mt-1 text-gray-700 px-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {message.text && (
                  <div
                    className={`p-4 rounded-md ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Course"}
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Course Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/courses")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Courses
                  </button>
                </div>
              </div>
            </div>

            {/* Book Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Book Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/books")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Books
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise Management Card */}

            {/* Devoir Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Devoir Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/devoirs")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Devoirs
                  </button>
                </div>
              </div>
            </div>

            {/* Exam Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Exam Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/exams")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Exams
                  </button>
                </div>
              </div>
            </div>

            {/* Exam Blancs Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Exam Blancs Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/exam-blancs")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Exam Blancs
                  </button>
                </div>
              </div>
            </div>

            {/* Page Descriptions Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Page Descriptions
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/page-descriptions")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Page Descriptions
                  </button>
                </div>
              </div>
            </div>

            {/* User Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  User Management
                </h3>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
