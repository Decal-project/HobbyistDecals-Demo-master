"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import BrowsePanel from "@/components/global/browse-panel";

// Define the Blog type for type safety
type Blog = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  cover_image_url: string;
  category_name: string;
  published_at: string;
};

// Async function to fetch a single blog post by ID
async function getBlog(id: string): Promise<Blog | null> {
  try {
    const res = await fetch(`/api/public-blogs/${id}`, {
      cache: "no-store", // Ensure fresh data on each request
    });
    if (!res.ok) return null; // Return null if the response is not OK (e.g., 404)
    return res.json(); // Parse and return the JSON response
  } catch {
    return null; // Return null if an error occurs during fetch
  }
}

// Async function to fetch recent blog posts
async function getRecentBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`/api/public-blogs`, {
      cache: "no-store", // Ensure fresh data
    });
    if (!res.ok) return []; // Return empty array if response not OK
    const data = await res.json();

    // Handle different API response structures if necessary
    if (data.blogs && Array.isArray(data.blogs)) return data.blogs;
    if (Array.isArray(data)) return data;
    return []; // Default to empty array
  } catch {
    return []; // Return empty array on error
  }
}

// Function to format blog content for display
function formatContent(content: string): string {
  const lines = content.split(/\r?\n/); // Split content by newlines
  const formattedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  // Helper to apply bold formatting based on markdown conventions
  const applyBold = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // For **bold**
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>"); // For *bold*

  // Checks for specific headings that need custom styling
  const isSpecialHeading = (line: string) =>
    ["Why Choose HobbyistDecals?", "Shipping and Return Policy"].includes(line);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const numberedLine = trimmed.match(/^(\d+)\.\s*(.*)$/); // Regex to detect numbered list items

    if (isSpecialHeading(trimmed)) {
      // If currently in a list, close it before adding the special heading
      if (inList) {
        formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
        listItems = [];
        inList = false;
      }
      // Add special heading with custom styling
      formattedLines.push(
        `<div class="mt-10 mb-4 text-xl font-semibold">${trimmed}</div>`
      );
      continue; // Move to the next line
    }

    if (numberedLine) {
      inList = true; // Mark that we are inside a list
      // Handle multi-line list items (e.g., "1.\n  Some text")
      if (!numberedLine[2] && i + 1 < lines.length && lines[i + 1].trim()) {
        const nextLine = lines[++i].trim();
        listItems.push(
          `<div class="flex items-start"><span class="font-bold mr-2">${numberedLine[1]}.</span><span>${applyBold(
            nextLine
          )}</span></div>`
        );
      } else {
        // Handle single-line list items
        listItems.push(
          `<div class="flex items-start"><span class="font-bold mr-2">${numberedLine[1]}.</span><span>${applyBold(
            numberedLine[2]
          )}</span></div>`
        );
      }
    } else {
      // If not a numbered list item
      if (inList) {
        // If coming out of a list, close the list div
        formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
        listItems = [];
        inList = false;
      }
      if (trimmed !== "") {
        // Add regular paragraph with bold formatting
        formattedLines.push(`<p>${applyBold(trimmed)}</p>`);
      }
    }
  }

  // Ensure any open list is closed at the end of the content
  if (inList) {
    formattedLines.push(`<div class="space-y-2">${listItems.join("")}</div>`);
  }

  return formattedLines.join("\n"); // Join all formatted lines
}

export default function BlogDetail() {
  const params = useParams();
  const id = params?.id as string; // Get blog ID from URL parameters

  // State variables for blog data and UI control
  const [blog, setBlog] = useState<Blog | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [formattedContent, setFormattedContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // State for category filtering
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  // Effect to fetch blog data and recent blogs when the ID changes
  useEffect(() => {
    if (!id) return; // Do nothing if ID is not available

    window.scrollTo(0, 0); // Scroll to the top of the page on ID change

    const fetchData = async () => {
      setLoading(true); // Set loading to true while fetching

      const [fetchedBlog, fetchedRecent] = await Promise.all([
        getBlog(id), // Fetch the current blog
        getRecentBlogs(), // Fetch all recent blogs
      ]);

      if (!fetchedBlog) {
        setNotFound(true); // If blog not found, set notFound state
        setLoading(false);
        return;
      }

      setBlog(fetchedBlog); // Set the fetched blog
      setFormattedContent(formatContent(fetchedBlog.content)); // Format its content
      setRecentBlogs(fetchedRecent); // Set recent blogs
      setLoading(false); // Set loading to false once data is fetched
    };

    fetchData();
  }, [id]); // Re-run this effect when 'id' changes

  // Effect to filter blogs whenever 'selectedCategory' or 'recentBlogs' changes
  // This automatically updates the filtered results when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      const filtered = recentBlogs.filter(
        (blog) =>
          blog.category_name &&
          // Ensure case-insensitive and whitespace-trimmed comparison
          blog.category_name.trim().toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredBlogs(filtered);
    } else {
      // If no category is selected, clear the filtered results
      // You could also setFilteredBlogs(recentBlogs) here if you want to show all when no filter is applied
      setFilteredBlogs([]);
    }
  }, [selectedCategory, recentBlogs]); // Dependencies: re-run when category or recent blogs change

  // Render loading state
  if (loading) return <div className="p-6 text-center text-lg">Loading...</div>;

  // Render not found state
  if (notFound) return <div className="p-6 text-center text-lg">Blog not found.</div>;

  // If blog is null (shouldn't happen after loading/not found checks, but good for type safety)
  if (!blog) return null;

  // Generate recommended blogs (excluding the current one, randomized, and sliced)
  const recommendedBlogs = recentBlogs
    .filter((b) => b.id !== blog.id) // Exclude the current blog
    .sort(() => 0.5 - Math.random()) // Randomize order
    .slice(0, 4); // Take the first 4

  return (
    <>
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Blog Content Section */}
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
            dangerouslySetInnerHTML={{ __html: formattedContent }} // Render HTML content
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

        {/* Sidebar Section */}
        <aside className="hidden lg:block sticky top-20 self-start h-fit">
          <div className="mb-6">
            <label htmlFor="category" className="block font-semibold mb-2">
              Search by Category
            </label>
            <div className="flex">
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)} // Update state on selection change
                className="flex-1 border border-gray-300 px-3 py-2 rounded-l-md focus:outline-none"
              >
                <option value="">Select a Category</option>
                <option value="Military Aviation">Military Aviation</option>
                <option value="Movie Vehicles">Movie Vehicles</option>
                <option value="Guides & Tutorials">Guides & Tutorials</option>
                <option value="Modeling Tips">Modeling Tips</option>
                <option value="Modeling History">Modeling History</option>
                <option value="How-To Guides">How-To Guides</option>
              </select>
              {/* Added a Clear button to easily reset the category filter */}
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded-r-md"
                onClick={() => setSelectedCategory("")} // Clears the selected category
              >
                Clear
              </button>
            </div>

            {/* Display filtered results if a category is selected */}
            {selectedCategory && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Results in "{selectedCategory}"
                </h3>
                {filteredBlogs.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredBlogs.map((blog) => (
                      <li key={blog.id}>
                        <Link
                          href={`/blogs/${blog.id}`}
                          className="text-gray-800 hover:text-[#16689A]"
                        >
                          {blog.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-600">
                    No blogs found in "{selectedCategory}".
                  </div>
                )}
              </div>
            )}
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

      {/* Recommended Blogs Section */}
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
