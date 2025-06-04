'use client';

import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Define TypeScript interfaces for API data
interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  avgOrderValue: number;
  salesByDate: Record<string, number>;
  salesByPaymentMethod: Record<string, number>;
}

export default function SalesAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch('/api/admin/analytics/sales');
      const json = await res.json();
      setData(json);
    };
    fetchAnalytics();
  }, []);

  if (!data) return <p className="p-4">Loading...</p>;

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
      <Sidebar title="📈 Analytics & Reporting" options={sidebarOptions} />

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={data.totalOrders} />
          <StatCard title="Total Revenue" value={`₹${data.totalRevenue.toFixed(2)} L`} />
          <StatCard title="Items Sold" value={data.totalItemsSold} />
          <StatCard title="Avg. Order Value" value={`₹${data.avgOrderValue.toFixed(2)}`} />
        </div>

        {/* Sales by Date (Line Chart) */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Sales by Date</h2>
          <Line
            data={{
              labels: Object.keys(data.salesByDate),
              datasets: [
                {
                  label: 'Revenue',
                  data: Object.values(data.salesByDate),
                  borderColor: '#3b82f6',
                  backgroundColor: '#93c5fd',
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>

        {/* Sales by Payment Method (Bar Chart) */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Sales by Payment Method</h2>
          <Bar
            data={{
              labels: Object.keys(data.salesByPaymentMethod),
              datasets: [
                {
                  label: 'Revenue',
                  data: Object.values(data.salesByPaymentMethod),
                  backgroundColor: '#10b981',
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// Sidebar Component
function Sidebar({
  title,
  options,
}: {
  title: string;
  options: { label: string; href: string }[];
}) {
  return (
    <aside className="w-full md:w-64 bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2 mb-6">
        {title}
      </h2>
      <ul className="space-y-3">
        {options.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block w-full text-white bg-indigo-600 hover:bg-indigo-700 font-semibold px-4 py-3 rounded-md text-left transition"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
