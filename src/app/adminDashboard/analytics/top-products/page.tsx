'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ProductStats = {
  product_id: string; // keep for keys but not displayed
  sku: string;
  name: string;
  total_units_sold: number;
  total_sales_revenue: number | string;
};

export default function TopProductsPage() {
  const [data, setData] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await fetch('/api/admin/analytics/top-products');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch top products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  const sidebarOptions = [
    { label: '💰 Sales Overview', href: '/adminDashboard/analytics/sales' },
    { label: '🔥 Top-Selling Decals', href: '/adminDashboard/analytics/top-products' },
    { label: '👑 Most Active Customers', href: '/adminDashboard/analytics/customers' },
    { label: '📉 Inventory Alerts', href: '/adminDashboard/analytics/inventory' },
    { label: '🛒 Abandoned Carts', href: '/adminDashboard/analytics/carts' },
  ];

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
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-600 hover:bg-indigo-50'
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
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">🔥 Top-Selling Decals</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {/* Removed Product ID column */}
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">SKU</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Units Sold</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Total Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.product_id}>
                    {/* Removed Product ID cell */}
                    <td className="px-4 py-2 text-gray-800">{item.sku}</td>
                    <td className="px-4 py-2 text-gray-800">{item.name}</td>
                    <td className="px-4 py-2 text-gray-800">{item.total_units_sold}</td>
                    <td className="px-4 py-2 text-gray-800">
                      ${Number(item.total_sales_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No data found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
