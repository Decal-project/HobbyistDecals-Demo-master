'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

type Customer = {
  name: string;
  email: string;
  contact: string;
};

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedInOnly, setLoggedInOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = `/api/customers${loggedInOnly ? '?loggedIn=true' : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching customers:', err);
        setLoading(false);
      });
  }, [loggedInOnly]);

  return (
    <div className="flex min-h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-100 border-r border-purple-300 p-4 shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
          <Users size={20} /> Customer Management
        </h2>
        <nav className="space-y-2 text-sm">
          <a
            href="/adminDashboard/customers/list"
            className="block px-3 py-2 rounded hover:bg-purple-200 text-purple-900 font-medium"
          >
            📃 View Customer List
          </a>
          <a
            href="/adminDashboard/customers/history"
            className="block px-3 py-2 rounded hover:bg-purple-200 text-purple-900 font-medium"
          >
            🧾 Order History & Contact
          </a>
          <a
            href="/adminDashboard/customers/loyalty"
            className="block px-3 py-2 rounded hover:bg-purple-200 text-purple-900 font-medium"
          >
            🎁 Loyalty Discounts
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-purple-800">Customer List</h1>
          <label className="flex items-center space-x-2 text-sm text-purple-700">
            <input
              type="checkbox"
              checked={loggedInOnly}
              onChange={(e) => setLoggedInOnly(e.target.checked)}
              className="form-checkbox text-purple-600 focus:ring-purple-500"
            />
            <span>Show only logged-in customers</span>
          </label>
        </div>

        {loading ? (
          <p className="text-purple-700">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-purple-700">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-purple-200 text-purple-800">
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-purple-50">
                    <td className="px-4 py-2">{customer.name}</td>
                    <td className="px-4 py-2">{customer.email}</td>
                    <td className="px-4 py-2">{customer.contact || 'N/A'}</td>
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
