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

export default function EditDeleteBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Blog>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      setBlogs(data.blogs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(blog: Blog) {
    setEditingId(blog.id);
    setFormData({ ...blog });
    setImageFile(null); // reset file
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
    setImageFile(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    const form = new FormData();
    for (const key in formData) {
      if (formData[key as keyof Blog]) {
        form.append(key, formData[key as keyof Blog] as string);
      }
    }
    if (imageFile) form.append("cover_image", imageFile);

    try {
      const res = await fetch(`/api/blogs/${editingId}`, {
        method: "PUT",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to update blog");
      await fetchBlogs();
      cancelEdit();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog");
      await fetchBlogs();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  }

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
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
            href="/adminDashboard/blogs/list"
            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-left flex items-center gap-2"
          >
            📃 View Blog List
          </a>
          <a
            href="/adminDashboard/blogs/edit"
            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-left flex items-center gap-2"
          >
            ✏️ Edit & Delete Blogs
          </a>
        </div>
      </aside>
    <main className="flex-1 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit & Delete Blogs</h1>
      {blogs.map((blog) =>
        editingId === blog.id ? (
          <form
            key={blog.id}
            className="border p-4 rounded shadow bg-gray-50 space-y-4"
            onSubmit={saveEdit}
          >
            <input name="title" placeholder="Title" className="w-full p-2 border rounded" value={formData.title || ""} onChange={handleChange} />
            <textarea name="content" placeholder="Content" className="w-full p-2 border rounded" rows={5} value={formData.content || ""} onChange={handleChange} />
            <input name="author_name" placeholder="Author Name" className="w-full p-2 border rounded" value={formData.author_name || ""} onChange={handleChange} />
            <input name="category_name" placeholder="Category" className="w-full p-2 border rounded" value={formData.category_name || ""} onChange={handleChange} />
            <input name="status" placeholder="Status" className="w-full p-2 border rounded" value={formData.status || ""} onChange={handleChange} />
            <input type="date" name="published_at" className="w-full p-2 border rounded" value={formData.published_at?.slice(0, 10) || ""} onChange={handleChange} />

            {/* File input for image */}
            <div>
              <p>Current Image: <a href={blog.cover_image_url} target="_blank" className="text-blue-600 underline">View</a></p>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
              <button type="button" onClick={cancelEdit} className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
            </div>
          </form>
        ) : (
          <div key={blog.id} className="border p-4 rounded shadow flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 truncate max-w-xl">{blog.content}</p>
            <p className="text-sm text-gray-500">
              Author: {blog.author_name} | Category: {blog.category_name} | Status: {blog.status} | Published:{" "}
              {new Date(blog.published_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button onClick={() => startEdit(blog)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit</button>
              <button onClick={() => deleteBlog(blog.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        )
      )}
      </main>
    </div>
  );
}
