'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Order {
  orderId: number;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  billingAddress: {
    country: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const links = [
    { href: '/adminDashboard/orders/all', label: '📄 View All Orders' },
    { href: '/adminDashboard/orders/refund', label: '🔄 Refund / Cancel Orders' },
    { href: '/adminDashboard/orders/track', label: '📦 Track Shipment' },
    { href: '/adminDashboard/orders/notes', label: '📝 Customer Notes' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Dashboard */}
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

      {/* Orders Table */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">📑 All Orders</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-auto rounded shadow">
            <table className="min-w-full table-auto border-collapse border border-gray-300 bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-4 py-2">Order ID</th>
                  <th className="border px-4 py-2">Customer</th>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Billing Address</th>
                  <th className="border px-4 py-2">Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 align-top">
                    <td className="border px-4 py-2">{order.orderId}</td>
                    <td className="border px-4 py-2">{order.customerName}</td>
                    <td className="border px-4 py-2">
                      {currencyFormatter.format(order.totalAmount)}
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 whitespace-pre-wrap">
                      {order.billingAddress.streetAddress}, {order.billingAddress.city},{" "}
                      {order.billingAddress.state} - {order.billingAddress.postalCode},<br />
                      {order.billingAddress.country}<br />
                      📞 {order.billingAddress.phone}
                    </td>
                    <td className="border px-4 py-2">
                      <ul className="list-disc ml-4 space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <span className="font-medium">{item.name}</span> — {item.quantity} ×{' '}
                            {currencyFormatter.format(item.price)}
                          </li>
                        ))}
                      </ul>
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
