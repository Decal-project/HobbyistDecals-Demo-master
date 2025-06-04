'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ✅ Define a type for a transaction
interface Transaction {
  id: number;
  total_amount: string;
  payment_method: string;
  created_at: string;
  weekday: string;
  month: string;
}

export default function TransactionReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]); // ✅ Use typed state

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/payments/reports');
      const json = await res.json();
      setTransactions(json.transactions || []);
    };
    fetchData();
  }, []);

  if (!transactions.length) return <p className="p-4">Loading transactions...</p>;

  // Aggregate revenue by weekday and month
  const revenueByWeekday: Record<string, number> = {};
  const revenueByMonth: Record<string, number> = {};

  transactions.forEach((tx) => {
    const weekday = tx.weekday.trim();
    const month = tx.month.trim();

    revenueByWeekday[weekday] = (revenueByWeekday[weekday] || 0) + parseFloat(tx.total_amount);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + parseFloat(tx.total_amount);
  });

  const sidebarOptions = [
    { label: '📊 View Transaction History', href: '/adminDashboard/payments/history' },
    { label: '⚠️ Failed Transactions', href: '/adminDashboard/payments/failed' },
    { label: '📈 Transaction Reports', href: '/adminDashboard/payments/reports' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Sidebar */}
      <div className="border-l-4 border-red-500 bg-white rounded shadow p-4 h-fit text-red-600">
        <h2 className="font-bold text-lg mb-4">💳 Payment & Transactions</h2>
        <ul className="space-y-2">
          {sidebarOptions.map((opt) => (
            <li key={opt.href}>
              <Link href={opt.href} className="text-sm hover:underline">
                {opt.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-8">
        <h1 className="text-2xl font-bold">📄 Transaction Report</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Revenue by Weekday</h2>
            <Bar
              data={{
                labels: Object.keys(revenueByWeekday),
                datasets: [
                  {
                    label: 'Revenue',
                    data: Object.values(revenueByWeekday),
                    backgroundColor: '#3b82f6',
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Revenue by Month</h2>
            <Bar
              data={{
                labels: Object.keys(revenueByMonth),
                datasets: [
                  {
                    label: 'Revenue',
                    data: Object.values(revenueByMonth),
                    backgroundColor: '#10b981',
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-auto">
          <h2 className="text-lg font-semibold mb-4">All Transactions</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Date</th>
                <th className="p-2">Weekday</th>
                <th className="p-2">Month</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-2">{tx.id}</td>
                  <td className="p-2">${parseFloat(tx.total_amount).toFixed(2)}</td>
                  <td className="p-2">{tx.payment_method}</td>
                  <td className="p-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="p-2">{tx.weekday.trim()}</td>
                  <td className="p-2">{tx.month.trim()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
