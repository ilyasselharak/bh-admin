"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddPageDescriptionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [pagePath, setPagePath] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    if (!pagePath.trim() || !title.trim() || !description.trim()) {
      setMessage({
        type: "error",
        text: "Page path, title, and description are required",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/page-descriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagePath: pagePath.trim(),
          title: title.trim(),
          description: description.trim(),
          shortDescription: shortDescription.trim(),
          isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Page description created successfully!" });
        // Reset form
        setPagePath("");
        setTitle("");
        setDescription("");
        setShortDescription("");
        setIsActive(true);
        
        // Redirect to page descriptions list after 2 seconds
        setTimeout(() => {
          router.push("/admin/page-descriptions");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create page description",
        });
      }
    } catch (err) {
      console.error("Error creating page description:", err);
      setMessage({
        type: "error",
        text: "An error occurred while creating the page description",
      });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-4xl font-bold text-indigo-900">Add New Page Description</h1>
          <Link
            href="/admin/page-descriptions"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Back to Page Descriptions
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="pagePath"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Page Path *
              </label>
              <input
                type="text"
                id="pagePath"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                required
                placeholder="/example-page"
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL path for this page (e.g., /about, /contact)
              </p>
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                required
                maxLength={200}
                placeholder="Enter page title"
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows={6}
                required
                placeholder="Enter full page description"
              />
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Short Description
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows={4}
                maxLength={500}
                placeholder="Enter short description (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {shortDescription.length}/500 characters
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (Page description will be visible)
              </label>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSubmitting ? "Creating..." : "Create Page Description"}
              </button>
              <Link
                href="/admin/page-descriptions"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

