'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Affiliate {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  is_active: boolean;
  created_at: string;
}

export default function ApprovedAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/affiliate')
      .then((res) => res.json())
      .then((data) => {
        const active = data.filter((a: Affiliate) => a.is_active);
        setAffiliates(active);
        setLoading(false);
      });
  }, []);

  const deactivateAffiliate = async (id: number) => {
    const res = await fetch('/api/affiliate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: false }),
    });

    if (res.ok) {
      setAffiliates((prev) => prev.filter((a) => a.id !== id));
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col gap-6 shadow-xl">
        <h2 className="text-2xl font-bold text-center">🛠️ Affiliate Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/adminDashboard/affiliates/approve")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            🍽️ Approve Requests
          </button>
          <button
            onClick={() => router.push("/adminDashboard/affiliates/approved")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            ✅ Approved Requests
          </button>
          <button
            onClick={() => router.push("/adminDashboard/affiliates/commissions")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            💸 Commissions
          </button>
          <button
            onClick={() => router.push("/adminDashboard/affiliates/visits")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            👀 Visits
          </button>
          <button
            onClick={() => router.push("/adminDashboard/affiliates/links")}
            className="py-3 bg-blue-700 rounded hover:bg-blue-600 transition"
          >
            🔗 Referral Links
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Approved Affiliates</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Registered</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="text-center border-t">
                  <td className="px-4 py-2">{a.firstname} {a.lastname}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{a.username}</td>
                  <td className="px-4 py-2">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deactivateAffiliate(a.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No approved affiliates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
