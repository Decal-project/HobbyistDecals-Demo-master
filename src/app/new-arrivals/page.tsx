"use client";

import React, { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  images: string[];
};

const ITEMS_PER_PAGE = 12;

const NewArrivalsPage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/featured");
        const data = await res.json();
        setFeatured(data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchFeatured();
  }, []);

  const totalPages = Math.ceil(featured.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = featured.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Discover Our Latest Hobbyist Decals – New Arrivals with Top-Quality Designs
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentItems.map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center shadow-sm">
            <img
              src={item.images?.[0] || "/placeholder.jpg"}
              alt={item.name}
              className="w-full h-auto rounded mb-2"
            />
            <p className="text-sm font-medium text-center">{item.name}</p>
            <p className="text-blue-600 font-bold mt-1">From $9.90</p>
            <button className="mt-2 text-sm text-gray-700 border-t border-gray-300 pt-2 hover:underline">
              SELECT OPTIONS
            </button>
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
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
            >
            {i + 1}
        </button>
        
        ))}
      </div>
    </div>
  );
};

export default NewArrivalsPage;
