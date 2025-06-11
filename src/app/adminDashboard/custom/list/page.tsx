"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

// Define the type for a gallery item for better type safety
interface GalleryItem {
  id: number;
  image_url: string;
  title: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string; // ISO 8601 string
}

export default function ListGalleryItems() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setLoading(true);
        const response = await fetch("/api/gallery"); // Your API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GalleryItem[] = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryItems();
  }, []); // Empty dependency array means this effect runs once after the initial render

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
        Loading gallery items...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 text-lg">
        Error: {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        No gallery items found.
      </div>
    );
  }

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
          Gallery Items
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-transform duration-200 hover:scale-105"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover border-b border-gray-200"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 flex-grow">
                    {item.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-auto">
                  <p>Order: {item.display_order}</p>
                  <p>Visibility: {item.is_visible ? "Visible" : "Hidden"}</p>
                  <p>Added: {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}