'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function SidebarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

interface Product {
  id: number;
  name: string | null;
  sku: string | null;
  regular_price?: number | null;
  sale_price?: number | null;
  images?: string | null; // Adjust if your API sends an array
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/addProduct/list');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addProduct/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Error deleting product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    [p.name, p.sku].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <p className="p-6">Loading products...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 text-purple-100 p-6 flex flex-col">
        <div className="mb-8 flex items-center space-x-3">
          <SidebarIcon className="w-6 h-6 text-purple-300" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex flex-col space-y-3 text-sm">
          <Link href="/adminDashboard/add-product" className="block px-3 py-2 rounded hover:bg-purple-700">
            ➕ Add Products
          </Link>
          <Link href="/adminDashboard/add-product/edit" className="block px-3 py-2 rounded bg-purple-700">
            🛠️ Edit and Delete Product
          </Link>
          <Link href="/adminDashboard/add-product/list" className="block px-3 py-2 rounded hover:bg-purple-700">
            📋 List of Products
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Product List</h1>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="border border-gray-300 rounded px-3 py-2 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <p>No matching products found.</p>
        ) : (
          <div className="grid grid-cols-6 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-300 rounded-lg p-4 shadow-sm flex flex-col items-center text-center bg-white relative"
              >
                {product.images ? (
                  <img
                    src={product.images}
                    alt={product.name || 'Product Image'}
                    className="max-w-full h-28 object-contain mb-2"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-100 mb-2 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
                <h2 className="text-base font-medium mb-1">{product.name || 'Unnamed Product'}</h2>
                <p className="text-sm text-gray-600 mb-1">SKU: {product.sku || 'N/A'}</p>
                <p className="font-semibold text-gray-900 mb-2">
                  Price: ${product.sale_price ?? product.regular_price ?? 'N/A'}
                </p>
                <div className="flex space-x-2 mt-auto">
                  <Link
                    href={`/adminDashboard/add-product/edit/${product.id}`}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
