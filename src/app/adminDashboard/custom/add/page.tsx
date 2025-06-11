"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function UploadGalleryItem() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!file || !title) {
      setError("Please select an image and provide a title.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("display_order", displayOrder.toString());
    formData.append("is_visible", isVisible.toString());

    try {
      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData: { error?: string } = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      const successData: { message: string } = await response.json();
      setMessage(successData.message);

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setDisplayOrder(0);
      setIsVisible(true);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload item.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-5 border-r border-gray-200 shadow-md flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Admin Dashboard</h2>
        <nav>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              🤝 Manage Custom Decals
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/adminDashboard/custom/add"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-left flex items-center gap-2 transition duration-200 ease-in-out"
              >
                ➕ Add Decals
              </Link>
              <Link
                href="/adminDashboard/custom/edit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-left flex items-center gap-2 transition duration-200 ease-in-out"
              >
                ✏️ Edit & Delete Decals
              </Link>
              <Link
                href="/adminDashboard/custom/list"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-left flex items-center gap-2 transition duration-200 ease-in-out"
              >
                📋 View Decal List
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-center mb-8 text-2xl font-bold text-gray-800">
          Upload New Gallery Item
        </h1>

        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="image-upload" className="block mb-1 font-bold">
              Image:
            </label>
            <input
              type="file"
              id="image-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="title" className="block mb-1 font-bold">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-bold">
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="display-order" className="block mb-1 font-bold">
              Display Order:
            </label>
            <input
              type="number"
              id="display-order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-visible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            <label htmlFor="is-visible" className="font-bold">
              Is Visible
            </label>
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Upload Item
          </button>
        </form>
      </main>
    </div>
  );
}
