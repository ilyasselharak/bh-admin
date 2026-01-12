"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageDescription {
  _id: string;
  pagePath: string;
  title: string;
  description: string;
  shortDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageDescriptionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [pageDescriptions, setPageDescriptions] = useState<PageDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPageDescription, setEditingPageDescription] = useState<PageDescription | null>(null);
  const [editedPagePath, setEditedPagePath] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedShortDescription, setEditedShortDescription] = useState("");
  const [editedIsActive, setEditedIsActive] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPageDescriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/page-descriptions");
        if (!response.ok) throw new Error("Failed to fetch page descriptions");
        const data = await response.json();
        setPageDescriptions(data);
      } catch (err) {
        setError("Error loading page descriptions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPageDescriptions();
    }
  }, [status]);

  const handleEdit = (pageDescription: PageDescription) => {
    setEditingPageDescription(pageDescription);
    setEditedPagePath(pageDescription.pagePath);
    setEditedTitle(pageDescription.title);
    setEditedDescription(pageDescription.description);
    setEditedShortDescription(pageDescription.shortDescription || "");
    setEditedIsActive(pageDescription.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingPageDescription) return;

    try {
      setError("");
      const response = await fetch(`/api/page-descriptions/${editingPageDescription._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagePath: editedPagePath,
          title: editedTitle,
          description: editedDescription,
          shortDescription: editedShortDescription,
          isActive: editedIsActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update page description");
      }

      // Update the page description in the local state
      const updatedPageDescription = await response.json();
      setPageDescriptions(
        pageDescriptions.map((pd) =>
          pd._id === editingPageDescription._id ? updatedPageDescription : pd
        )
      );

      setIsModalOpen(false);
      setEditingPageDescription(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating page description";
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (pageDescriptionId: string) => {
    if (!confirm("Are you sure you want to delete this page description?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/page-descriptions/${pageDescriptionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete page description");
      }

      // Remove the page description from the local state
      setPageDescriptions(pageDescriptions.filter((pd) => pd._id !== pageDescriptionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting page description";
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
          <h1 className="text-4xl font-bold text-indigo-900">Page Descriptions Management</h1>
          <Link
            href="/admin/page-descriptions/add"
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold"
          >
            Add New Page Description
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-indigo-600 text-lg">
            Loading page descriptions...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                    Page Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                    Short Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-indigo-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageDescriptions.map((pd, index) => (
                  <tr key={pd._id || `page-desc-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pd.pagePath}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pd.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {pd.shortDescription || pd.description.substring(0, 100)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pd.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pd.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(pd)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pd._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pageDescriptions.length === 0 && (
          <div className="text-center text-indigo-600 mt-12 text-lg">
            No page descriptions found. Create your first page description!
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && editingPageDescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                Edit Page Description
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Path *
                  </label>
                  <input
                    type="text"
                    value={editedPagePath}
                    onChange={(e) => setEditedPagePath(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                    placeholder="/example-page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedTitle.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={editedShortDescription}
                    onChange={(e) => setEditedShortDescription(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedShortDescription.length}/500 characters
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editedIsActive}
                    onChange={(e) => setEditedIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPageDescription(null);
                  }}
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

