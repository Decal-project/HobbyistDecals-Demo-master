"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  images: string[];
};

const ITEMS_PER_PAGE = 12;

const TopPicksPage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);  // New state for loading

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);  // Set loading to true when fetch starts
        const res = await fetch("/api/featured");
        const data = await res.json();
        setFeatured(data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);  // Set loading to false after fetch is complete
      }
    };

    fetchFeatured();
  }, []);

  const totalPages = Math.ceil(featured.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = featured.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div className="p-6 text-lg">Loading products...</div>;
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Browse Our Featured Decals – Top Picks for Quality and Design
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((item, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-lg p-4 flex flex-col items-center shadow-sm h-full"
          >
            <div className="w-full h-48 flex items-center justify-center bg-white p-2">
              <img
                src={item.images?.[0] || "/placeholder.jpg"}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* Product Name as Link */}
            <Link
              href={`/details/${encodeURIComponent(item.name)}`}
              className="text-sm font-medium text-center mt-2 text-blue-600 hover:underline"
            >
              {item.name}
            </Link>
            <p className="text-blue-600 font-bold mt-1">From $9.90</p>
            <div className="flex-grow"></div> {/* Ensures the button stays at the bottom */}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentPage(i + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-8 h-8 rounded-full ${
              currentPage === i + 1
                ? "bg-[#16689A] text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopPicksPage;
