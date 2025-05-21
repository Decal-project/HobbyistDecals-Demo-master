"use client";

import React, { useEffect, useState } from "react";

type Blog = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  cover_image_url: string;
  category_name: string;
  status: string;
  published_at: string;
};

export default function BlogsList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const data = await res.json();
        setBlogs(data.blogs);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Dashboard */}
      <aside className="w-full md:w-64 p-4 rounded border border-yellow-300 bg-white shadow-sm sticky top-6 self-start">
        <h2 className="text-xl font-bold text-yellow-800 mb-6 flex items-center gap-2">
          📝 Manage Blogs
        </h2>
        <div className="flex flex-col gap-3">
          <a
            href="/adminDashboard/blogs/create"
            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-left flex items-center gap-2"
          >
            ➕ Create Blog Post
          </a>
          <a
            href="/adminDashboard/blogs/edit"
            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-left flex items-center gap-2"
          >
            ✏️ Edit Blog Posts
          </a>
          <a
            href="/adminDashboard/blogs/list"
            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-left flex items-center gap-2"
          >
            📃 View Blog List
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>

        {blogs.length === 0 && <p>No blogs found.</p>}

        <div className="grid gap-8 md:grid-cols-2">
          {blogs.map((blog) => (
            <article key={blog.id} className="border rounded shadow p-4">
              <img
                src={blog.cover_image_url}
                alt={blog.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-700 mb-2">{blog.content.slice(0, 150)}...</p>
              <p className="text-sm text-gray-500 mb-1">
                Author: <span className="font-medium">{blog.author_name}</span>
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Category: <span className="font-medium">{blog.category_name}</span>
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Status: <span>{blog.status}</span>
              </p>
              <p className="text-sm text-gray-400">
                Published on: {new Date(blog.published_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
