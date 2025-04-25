"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  images: string[];
};

const NewArrivalsSection = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/premium");
        const data = await res.json();
        setFeatured(data);
      } catch (error) {
        console.error("Error fetching premium products:", error);
      }
    };

    fetchFeatured();
  }, []);

  const handleViewMoreClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/new-arrivals");
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-lg p-4 shadow-md mx-auto mt-8">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">
          Discover Our Latest Hobbyist Decals – New Arrivals with Top-Quality Designs
        </h2>
        <span
          onClick={handleViewMoreClick}
          className="text-sm text-[#16689A] font-semibold cursor-pointer hover:underline"
        >
          VIEW MORE →
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {featured.slice(0, 6).map((item, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-lg p-2 flex flex-col items-center shadow-sm h-full"
          >
            <div className="w-full h-40 flex items-center justify-center bg-white p-2">
              <img
                src={item.images?.[0] || "/placeholder.jpg"}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-sm font-medium text-center mt-2">{item.name}</p>
            <p className="text-blue-600 font-bold mt-1">From $9.90</p>
            <div className="flex-grow"></div> {/* Push the button to the bottom */}
            <button className="mt-2 text-sm text-gray-700 border-t border-gray-300 pt-2 hover:underline">
              SELECT OPTIONS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewArrivalsSection;
