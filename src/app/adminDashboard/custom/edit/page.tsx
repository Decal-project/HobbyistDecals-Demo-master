"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

// Define the type for a gallery item for better type safety
interface GalleryItem {
  id: number;
  image_url: string | null;
  title: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export default function GalleryManagementPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [editFile, setEditFile] = useState<File | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0);
  const [editIsVisible, setEditIsVisible] = useState<boolean>(true);
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/gallery/edit");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: GalleryItem[] = await response.json();
      setItems(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching items.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setEditTitle(editingItem.title);
      setEditDescription(editingItem.description || "");
      setEditDisplayOrder(editingItem.display_order);
      setEditIsVisible(editingItem.is_visible);
      setEditCurrentImageUrl(editingItem.image_url);
      setEditFile(null);
      setMessage(null);
      setError(null);
    }
  }, [editingItem]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setMessage(null);
      setError(null);
      const response = await fetch(`/api/gallery/edit?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item.");
      }

      const successData = await response.json();
      setMessage(successData.message);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while deleting.");
      }
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsUpdating(true);

    if (!editingItem || !editTitle) {
      setError("Item data or title is missing for update.");
      setIsUpdating(false);
      return;
    }

    const formData = new FormData();
    formData.append("id", editingItem.id.toString());
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    formData.append("display_order", editDisplayOrder.toString());
    formData.append("is_visible", editIsVisible.toString());

    if (editCurrentImageUrl) {
      formData.append("existing_image_url", editCurrentImageUrl);
    }

    if (editFile) {
      formData.append("image", editFile);
    } else if (!editCurrentImageUrl) {
      formData.append("clear_image", "true");
    }

    try {
      const response = await fetch("/api/gallery/edit", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong during update!");
      }

      const successData = await response.json();
      setMessage(successData.message);

      if (editFile) {
        setEditCurrentImageUrl(URL.createObjectURL(editFile));
      } else if (formData.get("clear_image") === "true") {
        setEditCurrentImageUrl(null);
      }

      setTimeout(() => {
        onCloseEditModal();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while updating.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const onCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    fetchGalleryItems();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Gallery Items
        </h1>

        {/* Message and Error Display */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Conditional Rendering for Main Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-150px)] text-lg text-gray-700">
            Loading gallery items...
          </div>
        ) : items.length === 0 ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-150px)] text-gray-500 text-lg">
            No gallery items found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-transform duration-200 hover:scale-105">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover border-b border-gray-200"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm border-b border-gray-200">
                    No Image
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 flex-grow">
                      {item.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-auto space-y-1">
                    <p>Order: {item.display_order}</p>
                    <p>Visibility: {item.is_visible ? "Visible" : "Hidden"}</p>
                    <p>Added: {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal (conditionally rendered) */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto w-full max-w-lg">
            <button
              onClick={onCloseEditModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Edit Gallery Item (ID: {editingItem.id})
            </h2>

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleEditFormSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Current Image:</label>
                {editCurrentImageUrl ? (
                  <img src={editCurrentImageUrl} alt="Current" className="max-w-[150px] h-auto mb-4 rounded-md border border-gray-300" />
                ) : (
                  <div className="max-w-[150px] h-24 flex items-center justify-center bg-gray-100 text-gray-500 text-xs mb-4 rounded-md border border-gray-300">
                    No Image
                  </div>
                )}
                <label htmlFor="edit-image-upload" className="block text-gray-700 text-sm font-bold mb-2">Upload New Image (optional):</label>
                <input
                  type="file"
                  id="edit-image-upload"
                  onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                <input
                  type="text"
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-display-order" className="block text-gray-700 text-sm font-bold mb-2">Display Order:</label>
                <input
                  type="number"
                  id="edit-display-order"
                  value={editDisplayOrder}
                  onChange={(e) => setEditDisplayOrder(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-is-visible"
                  checked={editIsVisible}
                  onChange={(e) => setEditIsVisible(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-is-visible" className="ml-2 block text-gray-700 text-sm font-bold">
                  Is Visible
                </label>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${
                  isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isUpdating ? "Updating..." : "Update Item"}
              </button>
              <button
                type="button"
                onClick={onCloseEditModal}
                className="w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200 font-semibold"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}