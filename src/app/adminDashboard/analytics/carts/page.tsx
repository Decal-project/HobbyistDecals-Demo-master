'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AbandonedCart = {
  cart_id: string;
  created_at: string;
  items_in_cart: number;
  order_email: string | null;
};

export default function AbandonedCartsPage() {
  const [data, setData] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const sidebarOptions = [
    { label: '💰 Sales Overview', href: '/adminDashboard/analytics/sales' },
    { label: '🔥 Top-Selling Decals', href: '/adminDashboard/analytics/top-products' },
    { label: '👑 Most Active Customers', href: '/adminDashboard/analytics/customers' },
    { label: '📉 Inventory Alerts', href: '/adminDashboard/analytics/inventory' },
    { label: '🛒 Abandoned Carts', href: '/adminDashboard/analytics/carts' },
  ];

  useEffect(() => {
    async function fetchCarts() {
      try {
        const res = await fetch('/api/admin/analytics/carts');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch abandoned carts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCarts();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2 mb-6">
          📈 Analytics & Reporting
        </h2>
        <ul className="space-y-3">
          {sidebarOptions.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block w-full font-semibold px-4 py-3 rounded-md text-left transition ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-4">🛒 Abandoned Carts</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No abandoned carts found.</p>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Cart ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Created At</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Items in Cart</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Order Email (if any)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((cart) => (
                  <tr key={cart.cart_id}>
                    <td className="px-4 py-2 text-gray-800">{cart.cart_id}</td>
                    <td className="px-4 py-2 text-gray-800">{new Date(cart.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-gray-800">{cart.items_in_cart}</td>
                    <td className="px-4 py-2 text-gray-800">{cart.order_email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
