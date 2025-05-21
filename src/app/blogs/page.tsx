"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Blog = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  cover_image_url: string;
  category_name: string;
  status: string;
  published_at: string;
};

const ITEMS_PER_PAGE = 12;

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/public-blogs/all");
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = blogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div className="p-6 text-lg text-center">Loading blogs...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Explore Our Latest Blogs
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentItems.map((blog) => (
          <div key={blog.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="h-40 w-full overflow-hidden">
              <img
                src={blog.cover_image_url || "/blog-placeholder.jpg"}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{blog.title}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                  />
                </svg>
                {new Date(blog.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex-grow"></div>
              <Link href={`/blogs/${blog.id}`}>
                <button className="mt-3 px-4 py-2 bg-[#16689A] text-white rounded hover:bg-orange-600 transition">
                  READ MORE
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
