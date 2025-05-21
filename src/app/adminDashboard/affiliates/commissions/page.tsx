'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Commission {
  user_id: number;
  visit_count: number;
  total_commission: number;
}

export default function AdminAffiliateCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/affiliate/commissions')
      .then((res) => res.json())
      .then((data) => {
        setCommissions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-6">Loading commissions...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col gap-6 shadow-xl">
        <h2 className="text-2xl font-bold text-center">🛠️ Affiliate Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <button onClick={() => router.push("/adminDashboard/affiliates/approve")} className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition">🍽️ Approve Requests</button>
          <button onClick={() => router.push("/adminDashboard/affiliates/approved")} className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition">✅ Approved Requests</button>
          <button onClick={() => router.push("/adminDashboard/affiliates/commissions")} className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition">💸 Commissions</button>
          <button onClick={() => router.push("/adminDashboard/affiliates/visits")} className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition">👀 Visits</button>
          <button onClick={() => router.push("/adminDashboard/affiliates/links")} className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition">🔗 Referral Links</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Affiliate Commissions</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Affiliate ID</th>
                <th className="px-4 py-2">Visit Count</th>
                <th className="px-4 py-2">Total Commission ($)</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((item) => (
                <tr key={item.user_id} className="text-center border-t">
                  <td className="px-4 py-2">{item.user_id}</td>
                  <td className="px-4 py-2">{item.visit_count}</td>
                  <td className="px-4 py-2 font-semibold text-green-700">${item.total_commission}</td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4">No commissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
