'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface OrderNote {
  id: number;
  billing_first_name: string;
  billing_email: string;
  billing_phone: string;
  order_notes: string;
  note_done: boolean;
}

export default function OrderNotesAdminPage() {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    axios
      .get('/api/admin/orders/notes')
      .then((res) => {
        setNotes(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch notes:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDone = async (id: number, current: boolean) => {
    try {
      await axios.post('/api/admin/orders/notes', { id, note_done: !current });
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, note_done: !current } : note
        )
      );
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const links = [
    { href: '/adminDashboard/orders/all', label: '📄 View All Orders' },
    { href: '/adminDashboard/orders/refund', label: '🔄 Refund / Cancel Orders' },
    { href: '/adminDashboard/orders/track', label: '📦 Track Shipment' },
    { href: '/adminDashboard/orders/notes', label: '📝 Customer Notes' },
  ];

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 p-4 rounded border border-yellow-300 bg-white shadow-sm">
        <h2 className="text-xl font-bold text-brown-800 mb-4 flex items-center gap-2">
          📑 Manage Orders
        </h2>
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <button
                className={`w-full text-left flex items-center gap-2 py-2 px-4 rounded ${
                  pathname === link.href
                    ? 'bg-amber-900 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                }`}
              >
                {link.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1">
        <h1 className="text-3xl font-semibold mb-6">Customer Notes</h1>
        {notes.length === 0 ? (
          <p>No customer notes available.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Note</th>
                  <th className="px-4 py-2 text-left">Done</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{note.billing_first_name}</td>
                    <td className="px-4 py-2">{note.billing_email}</td>
                    <td className="px-4 py-2">{note.billing_phone}</td>
                    <td className="px-4 py-2 whitespace-pre-wrap">{note.order_notes}</td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={note.note_done}
                        onChange={() => toggleDone(note.id, note.note_done)}
                        className="w-4 h-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
