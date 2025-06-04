'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function InventoryPage() {
  const pathname = usePathname();

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
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-2">📉 Inventory Alerts</h1>
        <hr className="border-gray-300" />
      </main>
    </div>
  );
}
