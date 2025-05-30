"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import BrowsePanel from "@/components/global/browse-panel";

type Blog = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  cover_image_url: string;
  category_name: string;
  published_at: string;
};

async function getBlog(id: string): Promise<Blog | null> {
  try {
    const res = await fetch(`/api/public-blogs/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRecentBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`/api/public-blogs`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();

    if (data.blogs && Array.isArray(data.blogs)) return data.blogs;
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

function formatContent(content: string): string {
  const lines = content.split(/\r?\n/);
  const formattedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const applyBold = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>");

  const isSpecialHeading = (line: string) =>
    ["Why Choose HobbyistDecals?", "Shipping and Return Policy"].includes(line);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const numberedLine = trimmed.match(/^(\d+)\.\s*(.*)$/);

    if (isSpecialHeading(trimmed)) {
      if (inList) {
        formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
        listItems = [];
        inList = false;
      }
      formattedLines.push(
        `<div class="mt-10 mb-4 text-xl font-semibold">${trimmed}</div>`
      );
      continue;
    }

    if (numberedLine) {
      inList = true;
      if (!numberedLine[2] && i + 1 < lines.length && lines[i + 1].trim()) {
        const nextLine = lines[++i].trim();
        listItems.push(
          `<div class="flex items-start"><span class="font-bold mr-2">${numberedLine[1]}.</span><span>${applyBold(
            nextLine
          )}</span></div>`
        );
      } else {
        listItems.push(
          `<div class="flex items-start"><span class="font-bold mr-2">${numberedLine[1]}.</span><span>${applyBold(
            numberedLine[2]
          )}</span></div>`
        );
      }
    } else {
      if (inList) {
        formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
        listItems = [];
        inList = false;
      }
      if (trimmed !== "") {
        formattedLines.push(`<p>${applyBold(trimmed)}</p>`);
      }
    }
  }

  if (inList) {
    formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
  }

  return formattedLines.join("\n");
}

export default function BlogDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [formattedContent, setFormattedContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setLoading(true);
      console.log("Fetching blog with ID:", id); // Optional debug

      const [fetchedBlog, fetchedRecent] = await Promise.all([
        getBlog(id),
        getRecentBlogs(),
      ]);

      if (!fetchedBlog) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBlog(fetchedBlog);
      setFormattedContent(formatContent(fetchedBlog.content));
      setRecentBlogs(fetchedRecent);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-lg">Loading...</div>;

  if (notFound) return <div className="p-6 text-center text-lg">Blog not found.</div>;

  if (!blog) return null;

  const recommendedBlogs = recentBlogs
    .filter((b) => b.id !== blog.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  return (
    <>
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Blog Content */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
          )}

          <article
            className="prose max-w-none text-justify leading-relaxed [&>*]:mb-4"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />

          <div className="mt-12">
            <h2 className="text-2xl font-semibold border-b inline-block mb-4">
              About the Author
            </h2>
            <div className="flex items-center bg-gray-100 p-4 rounded-lg space-x-4">
              <img
                src="https://hobbyistdecals.com/wp-content/uploads/al_opt_content/IMAGE/hobbyistdecals.com/wp-content/uploads/2024/06/Hobbiyst-Logo-Icon-3-300x96.png.bv_resized_desktop.png.bv.webp"
                alt="Author Avatar"
                width={80}
                height={80}
                className="rounded-full object-contain"
              />
              <span className="text-lg font-medium">{blog.author_name}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-20 self-start h-fit">
          <div className="mb-6">
            <label htmlFor="search" className="block font-semibold mb-2">
              Search
            </label>
            <div className="flex">
              <input
                id="search"
                type="text"
                className="flex-1 border border-gray-300 px-3 py-2 rounded-l-md focus:outline-none"
                placeholder="Search..."
              />
              <button className="bg-gray-800 text-white px-4 py-2 rounded-r-md">
                Search
              </button>
            </div>
          </div>

          <div className="border-t border-b py-4 text-center font-semibold tracking-wide">
            RECENT POSTS
          </div>

          <ul className="mt-4 space-y-4 text-l">
            {recentBlogs.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/blogs/${item.id}`}
                  className="text-gray-800 hover:text-[#16689A]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Recommended Blogs */}
      <div className="mt-5 px-4 lg:px-12">
        <h2 className="text-2xl font-semibold mb-6 border-b inline-block">
          You may also like these
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedBlogs.map((item) => (
            <Link
              href={`/blogs/${item.id}`}
              key={item.id}
              className="block bg-white hover:shadow-lg rounded-lg overflow-hidden transition-shadow"
            >
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
