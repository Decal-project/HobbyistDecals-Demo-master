'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar as SidebarIcon } from 'lucide-react';

type Order = {
  order_id: number;
  total_amount: string | number;
  created_at: string;
  products_ordered: string;
};

type CustomerSummary = {
  email: string;
  customer_name: string;
  contact: string | null;
  orders_count: number;
  total_spent: string | number;
  last_order_date: string;
  orders: Order[];
};

export default function CustomerOrderSummary() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/customers/history')
      .then(res => res.json())
      .then((data: CustomerSummary[]) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (email: string) => {
    setExpandedEmail(prev => (prev === email ? null : email));
  };

  return (
    <div className="flex min-h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 text-purple-100 p-6 flex flex-col">
        <div className="mb-8 flex items-center space-x-3">
          <SidebarIcon className="w-6 h-6 text-purple-300" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-3 text-sm">
          <a
            href="/adminDashboard/customers/list"
            className="block px-3 py-2 rounded hover:bg-purple-700 transition"
          >
            👥 Customer List
          </a>
          <a
            href="/adminDashboard/customers/history"
            className="block px-3 py-2 rounded bg-purple-700"
          >
            🧾 Order History
          </a>
          <a
            href="/adminDashboard/customers/loyalty"
            className="block px-3 py-2 rounded hover:bg-purple-700 transition"
          >
            🎁 Loyalty Discounts
          </a>
          {/* Add more sidebar links here */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-semibold text-purple-800 mb-4">🧾 Customer Order Summary</h1>

        {loading ? (
          <p className="text-purple-600">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-purple-600">No customer order history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-purple-200 text-purple-800">
                <tr>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2 text-left">Orders</th>
                  <th className="px-4 py-2 text-left">Total Spent</th>
                  <th className="px-4 py-2 text-left">Last Order Date</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <React.Fragment key={customer.email}>
                    <tr
                      className="border-b hover:bg-purple-50 cursor-pointer"
                      onClick={() => toggleExpand(customer.email)}
                    >
                      <td className="px-4 py-2">{customer.customer_name}</td>
                      <td className="px-4 py-2">{customer.email}</td>
                      <td className="px-4 py-2">{customer.contact || 'N/A'}</td>
                      <td className="px-4 py-2">{customer.orders_count}</td>
                      <td className="px-4 py-2">${Number(customer.total_spent).toFixed(2)}</td>
                      <td className="px-4 py-2">{new Date(customer.last_order_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-center">{expandedEmail === customer.email ? '▲' : '▼'}</td>
                    </tr>

                    {expandedEmail === customer.email && (
                      <tr className="bg-purple-100">
                        <td colSpan={7} className="px-4 py-2">
                          <table className="min-w-full bg-white rounded-md shadow-inner">
                            <thead className="bg-purple-300 text-purple-900">
                              <tr>
                                <th className="px-3 py-1 text-left text-sm">Order ID</th>
                                <th className="px-3 py-1 text-left text-sm">Products</th>
                                <th className="px-3 py-1 text-left text-sm">Total</th>
                                <th className="px-3 py-1 text-left text-sm">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customer.orders.map(order => (
                                <tr key={order.order_id} className="border-b">
                                  <td className="px-3 py-1 text-sm">#{order.order_id}</td>
                                  <td
                                    className="px-3 py-1 text-sm max-w-xs truncate"
                                    title={order.products_ordered}
                                  >
                                    {order.products_ordered}
                                  </td>
                                  <td className="px-3 py-1 text-sm">${Number(order.total_amount).toFixed(2)}</td>
                                  <td className="px-3 py-1 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
