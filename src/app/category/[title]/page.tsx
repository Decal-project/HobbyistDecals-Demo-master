"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Product = {
  regular_price: string;
  id: number;
  name: string;
  images: string[];
};

const CategoryPage = () => {
  const { title } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/product?category=${encodeURIComponent(title as string)}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [title]);

  if (loading) {
    return <div className="p-6 text-lg">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Category: {decodeURIComponent(title as string)}
      </h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found for this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageSrc = product.images?.[0] || "/placeholder.jpg";
            const encodedName = encodeURIComponent(product.name);

            return (
              <div
                key={product.id}
                className="border rounded-lg p-2 flex flex-col items-center hover:shadow-md transition"
              >
                <Image
                  src={imageSrc}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-[200px] object-contain rounded"
                />
                <p className="text-sm font-semibold mt-2 text-center text-gray-800">
                  {product.name}
                </p>
                <h2 className="text-sm font-bold text-[#16689A] mt-1 text-center">
                  {product.regular_price || "From $9.90"}
                </h2>
                <Link href={`/details/${encodedName}`}>
                  <button className="mt-3 px-4 py-2 bg-[#16689A] text-white rounded hover:bg-orange-600 transition">
                    Select Options
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
