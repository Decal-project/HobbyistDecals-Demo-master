'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  id: number;
  user_id: number;
  website: string;
  destination_url: string;
  code: string;
  tracking_link: string;
}

export default function AdminAffiliateLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/affiliate/alinks') // Ensure this API exists
      .then((res) => res.json())
      .then((data) => {
        setLinks(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-6">Loading...</div>;

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
        <h1 className="text-2xl font-bold mb-6">Affiliate Referral Links</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Website</th>
                <th className="px-4 py-2">Destination URL</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Tracking Link</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="text-center border-t">
                  <td className="px-4 py-2">{link.user_id}</td>
                  <td className="px-4 py-2">{link.website}</td>
                  <td className="px-4 py-2">{link.destination_url}</td>
                  <td className="px-4 py-2 font-mono text-sm">{link.code}</td>
                  <td className="px-4 py-2 text-blue-600 underline break-all">{link.tracking_link}</td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">No referral links found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
