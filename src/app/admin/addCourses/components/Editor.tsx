"use client";
import { Editor } from "@tinymce/tinymce-react";
import React, { useState, useEffect } from "react";

interface MediaData {
  url: string;
  type?: string;
}

interface MediaResolver {
  html: string;
}

function EditorCom() {
  const [isClient, setIsClient] = useState(false);
  const [course, setCourse] = useState("");
  const [exercice, setExercice] = useState("");
  const [devoir, setDevoir] = useState("");
  const [examen, setExamen] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [courseName, setCourseName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
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
          courseLink: course,
          exerciseLink: exercice,
          devoirLink: devoir,
          examenLink: examen,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Course added successfully!" });
        // Reset form
        setCourseName("");
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
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="bg-white mt-10">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <option value="SecondCollegeCourse">Second College</option>
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
          </optgroup>
          <optgroup label="Common Core">
            <option value="CommonCoreCourse">General</option>
            <option value="CommonCoreLettersCourse">Letters</option>
            <option value="CommonCoreScienceCourse">Science</option>
            <option value="CommonCoreTechnicalCourse">Technical</option>
          </optgroup>
        </select>
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

        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={course}
          onEditorChange={(newValue) => {
            setCourse(newValue);
          }}
          init={{
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
            images_upload_handler: async (blobInfo) => {
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
            file_picker_types: "image media",
            images_reuse_filename: true,
            images_upload_base_path: "/uploads",
            media_live_embeds: true,
            media_url_resolver: function (
              data: MediaData,
              resolve: (result: MediaResolver) => void
            ) {
              resolve({
                html: `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`,
              });
            },
          }}
        />
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={exercice}
          onEditorChange={(newValue) => {
            setExercice(newValue);
          }}
          init={{
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
            images_upload_handler: async (blobInfo) => {
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
            file_picker_types: "image media",
            images_reuse_filename: true,
            images_upload_base_path: "/uploads",
            media_live_embeds: true,
            media_url_resolver: function (
              data: MediaData,
              resolve: (result: MediaResolver) => void
            ) {
              resolve({
                html: `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`,
              });
            },
          }}
        />
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={devoir}
          onEditorChange={(newValue) => {
            setDevoir(newValue);
          }}
          init={{
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
            images_upload_handler: async (blobInfo) => {
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
            file_picker_types: "image media",
            images_reuse_filename: true,
            images_upload_base_path: "/uploads",
            media_live_embeds: true,
            media_url_resolver: function (
              data: MediaData,
              resolve: (result: MediaResolver) => void
            ) {
              resolve({
                html: `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`,
              });
            },
          }}
        />
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={examen}
          onEditorChange={(newValue) => {
            setExamen(newValue);
          }}
          init={{
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
            images_upload_handler: async (blobInfo) => {
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
            file_picker_types: "image media",
            images_reuse_filename: true,
            images_upload_base_path: "/uploads",
            media_live_embeds: true,
            media_url_resolver: function (
              data: MediaData,
              resolve: (result: MediaResolver) => void
            ) {
              resolve({
                html: `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`,
              });
            },
          }}
        />
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <div dangerouslySetInnerHTML={{ __html: course }} />
          <div dangerouslySetInnerHTML={{ __html: exercice }} />
          <div dangerouslySetInnerHTML={{ __html: course }} />
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
  );
}

export default EditorCom;
