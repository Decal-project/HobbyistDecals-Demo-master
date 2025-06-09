'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: number;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  shiprocket_shipment_id?: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setMessage('');
      try {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) {
          setMessage('Failed to load orders');
          return;
        }
        const data = await res.json();
        setOrders(data);
      } catch {
        setMessage('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []); // Removed message from dependencies

  const pushToShiprocket = async (id: number) => {
    setLoading(true);
    setMessage('');
    console.log('Sending order ID:', id);

    try {
      const res = await fetch('/api/shiprocket/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      console.log('Response:', result);

      if (res.ok) {
        setMessage(`✅ Order ${id} pushed to Shiprocket successfully! AWB: ${result.awb_code || 'N/A'}`);
      } else {
        setMessage(`❌ Failed to push order ${id}: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ Error: ${err.message}`);
      } else {
        setMessage('❌ Unknown error occurred');
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {message && <p className="mb-4 text-sm">{message}</p>}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="border p-4 rounded shadow-sm flex items-center justify-between">
            <div>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.shiprocket_shipment_id ? (
              <span>Pushed to Shiprocket (AWB: {order.shiprocket_shipment_id})</span>
            ) : (
              <button
                onClick={() => pushToShiprocket(order.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Pushing...' : 'Push to Shiprocket'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
