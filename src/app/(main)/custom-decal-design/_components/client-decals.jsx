"use client";
import React from "react";

const ClientDecals = () => {
  const images = [
    "/images/train1.jpg",
    "/images/train2.jpg",
    "/images/model1.jpg",
    "/images/model2.jpg",
    "/images/ship.jpg"
  ];

  return (
    <div className="mt-8 w-full">
      <h2 className="bg-[#16689A] text-white text-center py-2 text-xl font-semibold w-full rounded-lg">
        Our Custom Decals on Client's Scale Model
    </h2>
      <div className="flex overflow-x-auto space-x-4 bg-white shadow-md w-full scrollbar-hide">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Model ${index + 1}`}
            className="w-64 h-40 object-cover flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

export default ClientDecals;
