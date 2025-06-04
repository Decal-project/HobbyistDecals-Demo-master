'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type CustomerStats = {
  customer_id: string;       // billing_email
  customer_name: string;     // billing_first_name
  total_orders: number;
  total_units_bought: number;
};

export default function MostActiveCustomersPage() {
  const [data, setData] = useState<CustomerStats[]>([]);
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
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/analytics/customers');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen bg-gray-50">
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
      <main className="flex-1 bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">👑 Most Active Customers</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No data found.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Total Orders</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Units Bought</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td className="px-4 py-2 text-gray-800">{customer.customer_id}</td>
                    <td className="px-4 py-2 text-gray-800">{customer.customer_name || '—'}</td>
                    <td className="px-4 py-2 text-gray-800">{customer.total_orders}</td>
                    <td className="px-4 py-2 text-gray-800">{customer.total_units_bought}</td>
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
