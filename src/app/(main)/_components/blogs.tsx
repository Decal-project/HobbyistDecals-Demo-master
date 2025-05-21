"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const BlogsSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/public-blogs");
        const data = await res.json();
        setBlogs(data.slice(0, 6)); // latest 6
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  const handleViewMoreClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/blogs");
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-lg p-4 shadow-md mx-auto mt-8">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">
          Explore Our Latest Blogs 
        </h2>
        <span
          onClick={handleViewMoreClick}
          className="text-sm text-[#16689A] font-semibold cursor-pointer hover:underline"
        >
          VIEW MORE →
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {blogs.map((blog) => (
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

export default BlogsSection;
