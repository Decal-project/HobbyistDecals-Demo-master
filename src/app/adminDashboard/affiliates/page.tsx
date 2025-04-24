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

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/affiliate')
      .then((res) => res.json())
      .then((data) => {
        setAffiliates(data);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (id: number, current: boolean) => {
    const res = await fetch('/api/affiliate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    });

    if (res.ok) {
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_active: !current } : a
        )
      );
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
        <h1 className="text-2xl font-bold mb-6">Affiliate Registrations</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Registered</th>
                <th className="px-4 py-2">Status</th>
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
                    {a.is_active ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        a.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => toggleStatus(a.id, a.is_active)}
                    >
                      {a.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    No affiliates found.
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
