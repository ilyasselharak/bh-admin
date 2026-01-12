"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  content: string;
  image: string | null;
  description: string;
  author: string;
  isActive: boolean;
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

export default function BooksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedAuthor, setEditedAuthor] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [editedIsActive, setEditedIsActive] = useState(true);

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
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError("Error loading books");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchBooks();
    }
  }, [status]);

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setEditedTitle(book.title);
    setEditedContent(book.content);
    setEditedDescription(book.description || "");
    setEditedAuthor(book.author || "");
    setEditedImage(book.image || "");
    setEditedIsActive(book.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingBook) return;

    try {
      setError("");
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          description: editedDescription,
          author: editedAuthor,
          image: editedImage || null,
          isActive: editedIsActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update book");
      }

      // Update the book in the local state
      const updatedBook = await response.json();
      setBooks(
        books.map((book) =>
          book.id === editingBook.id ? updatedBook : book
        )
      );

      setIsModalOpen(false);
      setEditingBook(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating book";
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete book");
      }

      // Remove the book from the local state
      setBooks(books.filter((book) => book.id !== bookId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting book";
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
          <h1 className="text-4xl font-bold text-indigo-900">Books Management</h1>
          <Link
            href="/admin/books/add"
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold"
          >
            Add New Book
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-indigo-600 text-lg">
            Loading books...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <div
                key={book.id || `book-${index}`}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
              >
                {book.image && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                    {book.image.toLowerCase().includes("drive.google") ? (
                      <iframe
                        src={book.image}
                        className="w-full h-full border-0"
                        title={book.title}
                      />
                    ) : (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-2 text-indigo-900">
                  {book.title}
                </h2>
                {book.author && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Author:</span> {book.author}
                  </p>
                )}
                {book.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {book.description}
                  </p>
                )}
                <div className="flex items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      book.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 text-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center text-indigo-600 mt-12 text-lg">
            No books found. Create your first book!
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                Edit Book - {editingBook.title}
              </h2>

              <div className="space-y-4">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editedAuthor}
                    onChange={(e) => setEditedAuthor(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editedImage}
                    onChange={(e) => setEditedImage(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    value={editedContent}
                    onEditorChange={(newValue) => {
                      setEditedContent(newValue);
                    }}
                    init={editorConfig}
                  />
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
                    setEditingBook(null);
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

