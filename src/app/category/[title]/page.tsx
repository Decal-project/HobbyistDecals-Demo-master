"use client"
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
              <div key={product.id} className="border rounded-lg p-2 hover:shadow-md transition">
                <Image
                  src={imageSrc}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-[200px] object-contain rounded"
                />
                <Link
                  href={`/details/${encodedName}`}
                  className="block text-center text-blue-600 hover:underline mt-2 text-sm font-semibold"
                >
                  {product.name}
                </Link>
                <h2 className="text-sm font-semibold mt-1 text-center">{product.regular_price}</h2>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
