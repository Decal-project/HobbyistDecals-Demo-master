'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Visit {
  id: number;
  user_id: number;
  landing_url: string;
  visited_at: string;
  affiliate_user: number;
}

export default function AdminAffiliateVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/affiliate/avisits')
      .then((res) => res.json())
      .then((data) => {
        setVisits(data);
        setLoading(false);
      });
  }, []);

  const visitCount = visits.length;

  if (loading) return <div className="text-center p-6">Loading visits...</div>;

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
        <h1 className="text-2xl font-bold mb-4">Affiliate Visits</h1>

        {/* Visit Count */}
        <div className="mb-6 text-lg font-medium">
          Total Visits Recorded: <span className="text-blue-600 font-bold">{visitCount}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Visit ID</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Landing URL</th>
                <th className="px-4 py-2">Visited At</th>
                <th className="px-4 py-2">Affiliate User</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="text-center border-t">
                  <td className="px-4 py-2">{visit.id}</td>
                  <td className="px-4 py-2">{visit.user_id}</td>
                  <td className="px-4 py-2 break-all">{visit.landing_url}</td>
                  <td className="px-4 py-2">{new Date(visit.visited_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{visit.affiliate_user}</td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">No visits recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
