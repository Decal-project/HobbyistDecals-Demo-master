"use client";

import React, { useEffect, useState } from "react";
import BrowsePanel from "@/components/global/browse-panel";
import Link from "next/link";
import DecalListCarousalComponent from "@/components/global/decals-list-carousal";
import { categoriesList } from "@/lib/constants";
import TopPicksComponent from "../_components/top-picks";
import NewArrivalsSection from "../_components/new-arrivals";

interface Product {
  id: number;
  name: string;
  regular_price: string;
  images: string[];
}

const ShopPage: React.FC = () => {
  const [sort, setSort] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error("An unknown error occurred.");
        }
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="p-6">Loading products…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <>
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="max-w-7xl mx-auto p-6 font-sans">
        {/* Breadcrumb */}
        <div className="text-gray-600 text-sm mb-4 bg-gray-200 p-6">
          <span className="text-blue-500 text-xl">HobbyistDecals</span> &gt;{" "}
          <span className="font-semibold text-xl">Decal Shop</span>
        </div>

        {/* Sorting and Results */}
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-gray-600">
            SHOWING 1-{products.length} OF {products.length} RESULTS
          </span>
          <select
            className="border px-3 py-1 rounded-md"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <option value="default">DEFAULT SORTING</option>
            <option value="category">Sort By Category</option>
            <option value="top">Sort By Top Picks</option>
            <option value="new">Sort By New Arrivals</option>
          </select>
        </div>

        {/* Conditional Sections */}
        {sort === "category" && (
          <div className="my-6">
            <DecalListCarousalComponent
              title="Explore our wide range of high-quality decal categories"
              list={categoriesList}
            />
          </div>
        )}

        {sort === "top" && (
          <div className="my-6">
            <TopPicksComponent />
          </div>
        )}

        {sort === "new" && (
          <div className="my-6">
            <NewArrivalsSection />
          </div>
        )}

        {/* Product Grid (hide if sort is category, top, or new) */}
        {sort === "default" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded-xl text-center">
                {product.images.length ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    No Image
                  </div>
                )}
                <p className="text-sm font-semibold mt-2">{product.name}</p>
                <p className="text-[#16689A] font-bold mt-1">
                  ${parseFloat(product.regular_price).toFixed(2)}
                </p>
                <Link href={`/details/${encodeURIComponent(product.name)}`}>
                  <button className="mt-3 px-4 py-2 bg-[#16689A] text-white rounded hover:bg-orange-600 transition">
                    SELECT OPTIONS 
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ShopPage;
