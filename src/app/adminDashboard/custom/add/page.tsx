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
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      const successData = await response.json();
      setMessage(successData.message);
      // Optionally reset form fields after successful submission
      setFile(null);
      setTitle("");
      setDescription("");
      setDisplayOrder(0);
      setIsVisible(true);
      (document.getElementById("image-upload") as HTMLInputElement).value = ""; // Clear file input
    } catch (err: any) {
      setError(err.message || "Failed to upload item.");
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {" "}
      {/* Added bg-gray-50 for overall background */}
      {/* The Sidebar Section */}
      <aside className="w-64 bg-gray-100 p-5 border-r border-gray-200 shadow-md flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Admin Dashboard
        </h2>
        <nav>
          {/* Custom Decals Section */}
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
      {/* Main content area */}
      <main className="flex-1 p-8">
        <h1
          style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}
        >
          Upload New Gallery Item
        </h1>
        {message && (
          <p
            style={{ color: "green", textAlign: "center", marginBottom: "15px" }}
          >
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label
              htmlFor="image-upload"
              style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
            >
              Image:
            </label>
            <input
              type="file"
              id="image-upload"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              accept="image/*"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="title"
              style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
            >
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
            >
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="display-order"
              style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
            >
              Display Order:
            </label>
            <input
              type="number"
              id="display-order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="is-visible"
              style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}
            >
              <input
                type="checkbox"
                id="is-visible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                style={{ marginRight: "10px" }}
              />
              Is Visible
            </label>
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 15px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "20px",
            }}
          >
            Upload Item
          </button>
        </form>
      </main>
    </div>
  );
}