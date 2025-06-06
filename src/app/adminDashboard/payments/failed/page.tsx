// src/app/adminDashboard/payments/failed/page.tsx
'use client';

import { useEffect, useState } from 'react';

// Define interfaces for failed transactions (ensure these match your API response)
interface FailedPayment {
    payment_id: number;
    order_id: number;
    // Changed 'amount' to 'any' to allow for string/number, and handle conversion safely.
    // Ideally, your API or DB query would ensure it's a number.
    amount: number | string | null;
    currency: string;
    payment_status: string;
    payment_created_at: string;
    billing_email: string;
    billing_first_name: string;
    billing_last_name: string;
}

interface GeneralPendingOrder {
    order_id: number;
    amount: number | string | null; // Also updated for consistency
    payment_method: string;
    billing_email: string;
    billing_first_name: string;
    billing_last_name: string;
    order_created_at: string;
    order_status: string;
}

interface PaypalPendingOrder {
    order_id: number;
    amount: number | string | null; // Also updated for consistency
    payment_method: string;
    billing_email: string;
    billing_first_name: string;
    billing_last_name: string;
    order_created_at: string;
    order_status: string;
    paypal_order_id: string;
    paypal_payer_id: string;
}

export default function FailedTransactionsPage() {
    const [stripeFailedPayments, setStripeFailedPayments] = useState<FailedPayment[]>([]);
    const [generalPendingOrders, setGeneralPendingOrders] = useState<GeneralPendingOrder[]>([]);
    const [paypalPendingOrders, setPaypalPendingOrders] = useState<PaypalPendingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFailedTransactions = async () => {
            try {
                const res = await fetch('/api/admin/failed-transactions');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setStripeFailedPayments(data.stripeFailedPayments || []);
                setGeneralPendingOrders(data.generalPendingOrders || []);
                setPaypalPendingOrders(data.paypalPendingOrders || []);
            } catch (err) {
                console.error("Error fetching failed transactions:", err);
                setError("Failed to load transactions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFailedTransactions();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Loading failed transactions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    // Helper function to safely format amount
    const formatAmount = (amount: number | string | null, currency?: string) => {
        if (amount === null || amount === undefined) {
            return 'N/A';
        }
        const numericAmount = parseFloat(amount.toString()); // Convert to string first to handle various types
        if (isNaN(numericAmount)) {
            return 'Invalid Amount';
        }
        return `${numericAmount.toFixed(2)}${currency ? ` ${currency.toUpperCase()}` : ''}`;
    };


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">❌ Failed and Pending Transactions</h1>

            {/* Failed Stripe Payments */}
            <section className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-red-700">Failed Stripe Payments</h2>
                <div className="overflow-x-auto">
                    {stripeFailedPayments.length > 0 ? (
                        <table className="min-w-full table-auto border border-gray-200">
                            <thead className="bg-red-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stripeFailedPayments.map((fp) => (
                                    <tr key={fp.payment_id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{fp.payment_id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{fp.order_id}</td>
                                        {/* Use the new formatAmount helper */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatAmount(fp.amount, fp.currency)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{fp.billing_email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">{fp.payment_status.toUpperCase()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(fp.payment_created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No failed Stripe payments found.</p>
                    )}
                </div>
            </section>

            {/* Pending PayPal Orders (Stuck) */}
            <section className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-orange-700">Pending PayPal Orders (Older than 1 Hour)</h2>
                <div className="overflow-x-auto">
                    {paypalPendingOrders.length > 0 ? (
                        <table className="min-w-full table-auto border border-gray-200">
                            <thead className="bg-orange-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PayPal Order ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paypalPendingOrders.map((po) => (
                                    <tr key={po.order_id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{po.order_id}</td>
                                        {/* Use the new formatAmount helper */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatAmount(po.amount)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{po.billing_email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">{po.order_status.toUpperCase()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{po.paypal_order_id || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(po.order_created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No old pending PayPal orders found.</p>
                    )}
                </div>
            </section>

            {/* General Pending Orders (Older than 1 Hour, non-Stripe/PayPal) */}
            <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-700">General Pending Orders (Older than 1 Hour)</h2>
                <div className="overflow-x-auto">
                    {generalPendingOrders.length > 0 ? (
                        <table className="min-w-full table-auto border border-gray-200">
                            <thead className="bg-yellow-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {generalPendingOrders.map((gpo) => (
                                    <tr key={gpo.order_id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{gpo.order_id}</td>
                                        {/* Use the new formatAmount helper */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatAmount(gpo.amount)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{gpo.payment_method}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{gpo.billing_email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-600">{gpo.order_status.toUpperCase()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(gpo.order_created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No other old pending orders found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}