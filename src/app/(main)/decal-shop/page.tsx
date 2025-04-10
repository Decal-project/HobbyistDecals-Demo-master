"use client"
import React, { useState } from "react";
import BrowsePanel from "@/components/global/browse-panel";

const products = [
  {
    title: "'23' Dayton Chassis Midget-Speedcar Decals – 1/24 – Water Decal",
    price: "$9.90",
    image: "images/product1.png",
  },
  {
    title: "'Andersons MACK Superliner' Truck Decals – 1/24 – Water Decal",
    price: "$11.99",
    image: "images/product2.png",
  },
  {
    title: "'Aya Aviator' Cessna 172 Plane Decals – 1/48 – Water Decal",
    price: "$9.90",
    image: "images/product3.png",
  },
  {
    title: "'GRAYS (Finley)' T900 90s Kenworth Truck Decals – 1/25 1/50 – Water Decal",
    price: "$13.99 – $16.99",
    image: "images/product4.png",
  },
  {
    title: "'High Ballin' 'Iron Duke' Kenworth K123 Truck Decals",
    price: "$9.90",
    image: "images/product5.png",
  },
];

const ShopPage = () => {
  const [sort, setSort] = useState("default");

  return (
    <div className="max-w-7xl mx-auto p-6  font-sans">
        <div className="w-full">
                <BrowsePanel />
              </div>
        
      {/* Breadcrumb */}
      <div className="text-gray-600 text-sm mb-4 bg-gray-200 p-6">
        <span className="text-blue-500 text-xl">HobbyistDecals</span> &gt; <span className="font-semibold text-xl">Decal Shop</span>
      </div>

      {/* Sorting and Results */}
      <div className="flex justify-between items-center border-b pb-3">
        <span className="text-gray-600">SHOWING 1-12 OF 617 RESULTS</span>
        <select 
          className="border px-3 py-1 rounded-md"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">DEFAULT SORTING</option>
          <option value="default">Sort By popularity</option>
          <option value="default">Sort By latest</option>
          <option value="price-low"> Sort By Price: Low to High</option>
          <option value="price-high"> Sort By Price: High to Low</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {products.map((product, index) => (
          <div key={index} className="border p-4 rounded-xl text-center">
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-lg" />
            <h2 className="text-sm font-semibold mt-2">{product.title}</h2>
            <p className="text-blue-600 font-bold mt-1">{product.price}</p>
            <button className="bg-gray-200 text-white px-3 py-1 mt-2 rounded-md text-sm">
              SELECT OPTIONS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
