"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description?: string;
  image_url?: string | null;
  price?: number | null;
}

const SearchClient = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setError(null);
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Unknown API error' }));
          throw new Error(`HTTP error! status: ${res.status}, Message: ${errorData.error || errorData.message}`);
        }
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
        setError(`Failed to load search results: ${err.message || 'Please try again.'}`);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">Search Results for &quot;{query}&quot;</h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="text-center text-gray-500">No results found for &quot;{query}&quot;.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {results.map((product) => (
          <div key={product.id} className="border p-4 rounded-xl text-center">
            {product.image_url ? (
              <Image
                src={
                  product.image_url.startsWith("http") || product.image_url.startsWith("/")
                    ? product.image_url
                    : `/images/${product.image_url}`
                }
                alt={product.name || "Product Image"}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <p className="text-sm font-semibold mt-2">{product.name}</p>

            {typeof product.price === "number" && !isNaN(product.price) ? (
              <p className="text-[#16689A] font-bold mt-1">${product.price.toFixed(2)}</p>
            ) : (
              <p className="text-gray-500 font-bold mt-1">$NaN</p>
            )}

            <Link href={`/details/${encodeURIComponent(product.name)}`}>
              <button className="mt-3 px-4 py-2 bg-[#16689A] text-white rounded hover:bg-orange-600 transition">
                SELECT OPTIONS
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchClient;
