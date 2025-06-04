'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

type Customer = {
  email: string;
  customer_name: string;
  phone: string;
  orders_count: number;
  total_products: number;
  total_spent: number | string;
  discount_percent?: number;
  from_date?: string;
  to_date?: string;
};

export default function LoyaltyAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingEmail, setEditingEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    discount_percent: '',
    from_date: '',
    to_date: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get('/api/customers/loyalty');
    setCustomers(res.data);
  };

  const startEditing = (customer: Customer) => {
    setEditingEmail(customer.email);
    setFormData({
      discount_percent: customer.discount_percent?.toString() || '',
      from_date: customer.from_date ? customer.from_date.slice(0, 10) : '',
      to_date: customer.to_date ? customer.to_date.slice(0, 10) : '',
    });
  };

  const saveDiscount = async () => {
    await axios.post('/api/customers/loyalty', {
      email: editingEmail,
      discount_percent: parseFloat(formData.discount_percent),
      from_date: formData.from_date,
      to_date: formData.to_date,
    });
    setEditingEmail('');
    fetchCustomers();
  };

  // For active link styling: Get current pathname (if using Next.js 13+, else replace with your router logic)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="flex min-h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-100 border-r border-purple-300 p-6 shadow-md flex-shrink-0">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-800">
          <Users size={20} /> Customer Management
        </h2>
        <nav className="space-y-3 text-sm">
          <a
            href="/adminDashboard/customers/list"
            className={`block px-4 py-2 rounded font-medium ${
              currentPath === '/adminDashboard/customers/list'
                ? 'bg-purple-300 text-purple-900'
                : 'text-purple-900 hover:bg-purple-200'
            }`}
          >
            📃 View Customer List
          </a>
          <a
            href="/adminDashboard/customers/history"
            className={`block px-4 py-2 rounded font-medium ${
              currentPath === '/adminDashboard/customers/history'
                ? 'bg-purple-300 text-purple-900'
                : 'text-purple-900 hover:bg-purple-200'
            }`}
          >
            🧾 Order History & Contact
          </a>
          <a
            href="/adminDashboard/customers/loyalty"
            className={`block px-4 py-2 rounded font-medium ${
              currentPath === '/adminDashboard/customers/loyalty'
                ? 'bg-purple-300 text-purple-900'
                : 'text-purple-900 hover:bg-purple-200'
            }`}
          >
            🎁 Loyalty Discounts
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-900">Customer Loyalty Discounts</h2>
        <div className="overflow-x-auto border rounded bg-white shadow">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Orders</th>
                <th className="border px-4 py-2">Products</th>
                <th className="border px-4 py-2">Total Spent ($)</th>
                <th className="border px-4 py-2">Loyalty (%)</th>
                <th className="border px-4 py-2">Valid From</th>
                <th className="border px-4 py-2">Valid To</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="text-center">
                  <td className="border px-2 py-1">{c.email}</td>
                  <td className="border px-2 py-1">{c.customer_name}</td>
                  <td className="border px-2 py-1">{c.phone}</td>
                  <td className="border px-2 py-1">{c.orders_count}</td>
                  <td className="border px-2 py-1">{c.total_products}</td>
                  <td className="border px-2 py-1">
                    {typeof c.total_spent === 'number'
                      ? c.total_spent.toFixed(2)
                      : parseFloat(c.total_spent).toFixed(2)}
                  </td>
                  {editingEmail === c.email ? (
                    <>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          step="0.01"
                          className="w-16 border rounded px-1"
                          value={formData.discount_percent}
                          onChange={(e) =>
                            setFormData({ ...formData, discount_percent: e.target.value })
                          }
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="date"
                          value={formData.from_date}
                          onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="date"
                          value={formData.to_date}
                          onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded"
                          onClick={saveDiscount}
                        >
                          Save
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border px-2 py-1">
                        {c.discount_percent != null ? c.discount_percent : '-'}
                      </td>
                      <td className="border px-2 py-1">
                        {c.from_date ? format(new Date(c.from_date), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="border px-2 py-1">
                        {c.to_date ? format(new Date(c.to_date), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => startEditing(c)}
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
