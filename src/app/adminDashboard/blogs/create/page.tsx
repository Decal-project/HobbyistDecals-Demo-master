"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title || !content || !authorName || !categoryName || !status || !publishedAt || !imageFile) {
      setError("Please fill in all fields and select an image.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("author_name", authorName);
      formData.append("category_name", categoryName);
      formData.append("status", status);
      formData.append("published_at", publishedAt);
      formData.append("image", imageFile);

      const res = await fetch("/api/blogs/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      router.push("/adminDashboard/blogs/list");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-6">➕ Create Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
          {error && <p className="text-red-600">{error}</p>}

          <div>
            <label className="block font-medium mb-2">Title</label>
            <input
              type="text"
              className="w-full border px-4 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Content</label>
            <textarea
              rows={6}
              className="w-full border px-4 py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Author Name</label>
            <input
              type="text"
              className="w-full border px-4 py-2"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Category</label>
            <input
              type="text"
              className="w-full border px-4 py-2"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Status</label>
            <select
              className="w-full border px-4 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Published At</label>
            <input
              type="datetime-local"
              className="w-full border px-4 py-2"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Upload Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 w-full max-h-60 object-contain"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800"
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </main>
    </div>
  );
}
