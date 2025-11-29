"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import Link from "next/link";

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

export default function AddBookPage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    if (!title.trim() || !content.trim()) {
      setMessage({
        type: "error",
        text: "Title and content are required",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          description: description.trim(),
          author: author.trim(),
          image: image.trim() || null,
          pdfUrl: pdfUrl.trim() || null,
          isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Book created successfully!" });
        // Reset form
        setTitle("");
        setContent("");
        setDescription("");
        setAuthor("");
        setImage("");
        setPdfUrl("")
        setIsActive(true);
        
        // Redirect to books list after 2 seconds
        setTimeout(() => {
          router.push("/admin/books");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create book",
        });
      }
    } catch (err) {
      console.error("Error creating book:", err);
      setMessage({
        type: "error",
        text: "An error occurred while creating the book",
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
          <h1 className="text-4xl font-bold text-indigo-900">Add New Book</h1>
          <Link
            href="/admin/books"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Back to Books
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter book title"
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Author
              </label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pdf URL
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows={4}
                maxLength={500}
                placeholder="Enter book description"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (Book will be visible to users)
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
                {isSubmitting ? "Creating..." : "Create Book"}
              </button>
              <Link
                href="/admin/books"
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

