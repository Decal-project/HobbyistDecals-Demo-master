'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Define a type for your order data
interface Order {
    id: number;
    customerName: string;
    totalAmount: string;
    paymentMethod: 'stripe' | 'paypal' | 'cod' | string;
    status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'partially_refunded' | string;
    createdAt: string;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
    refund_amount?: string | number;
}

// Define specific types for API payloads to avoid using 'any'
interface RefundPayload {
    orderId: number;
    amount: number;
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | '';
    paymentIntentId?: string;
    paypalOrderId?: string;
}

interface CancelPayload {
    orderId: number;
    reason: string;
    amount?: number;
    paymentMethod?: string;
    paymentIntentId?: string;
    paypalOrderId?: string;
}


export default function RefundCancelOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [refundReason, setRefundReason] = useState<'duplicate' | 'fraudulent' | 'requested_by_customer' | ''>('');
    const [isProcessingRefund, setIsProcessingRefund] = useState(false);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setRefundMessage(null);
            setError(null); // Clear previous errors on re-fetch

            const response = await fetch('/api/admin/orders');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            console.log('Frontend: Raw data from /api/admin/orders:', rawData);

            const ordersArray: Order[] = Array.isArray(rawData) ? rawData : Object.values(rawData) as Order[];
            console.log('Frontend: Converted orders array:', ordersArray);

            setOrders(ordersArray);
        } catch (err: unknown) {
            console.error("Frontend: Failed to fetch orders:", err);
            if (err instanceof Error) {
                setError(`Failed to load orders. Please try again. Error: ${err.message}`);
            } else {
                setError("An unknown error occurred while fetching orders.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSelectOrderForRefund = (order: Order) => {
        setSelectedOrderId(order.id);
        setRefundAmount(parseFloat(order.totalAmount) || 0);
        setRefundReason('');
        setRefundMessage(null);
    };

    const handleRefund = async () => {
        if (selectedOrderId === null) return;

        const orderToRefund = orders.find(order => order.id === selectedOrderId);
        if (!orderToRefund) {
            setRefundMessage("Selected order not found for refund.");
            return;
        }

        const currentTotalAmount = parseFloat(orderToRefund.totalAmount);
        if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > currentTotalAmount) {
            setRefundMessage("Please enter a valid refund amount (greater than 0 and less than or equal to total amount).");
            return;
        }

        if (!refundReason) {
            setRefundMessage("Please select a valid refund reason.");
            return;
        }

        if (orderToRefund.paymentMethod === 'cod') {
            setRefundMessage("Cannot process API refund for Cash on Delivery orders. Handle manually.");
            return;
        }

        setIsProcessingRefund(true);
        setRefundMessage(null);

        try {
            let endpoint = '';
            const payload: RefundPayload = {
                orderId: selectedOrderId,
                amount: refundAmount,
                reason: refundReason,
            };

            if (orderToRefund.paymentMethod === 'stripe') {
                if (!orderToRefund.stripePaymentIntentId || !orderToRefund.stripePaymentIntentId.startsWith('pi_')) {
                    throw new Error("Stripe Payment Intent ID (pi_...) missing or invalid for this order. Cannot initiate Stripe refund.");
                }
                endpoint = '/api/refund-stripe';
                payload.paymentIntentId = orderToRefund.stripePaymentIntentId;
            } else if (orderToRefund.paymentMethod === 'paypal') {
                if (orderToRefund.paypalCaptureId) {
                    payload.paypalOrderId = orderToRefund.paypalCaptureId;
                    console.log(`Frontend: Sending PayPal Capture ID for refund: ${orderToRefund.paypalCaptureId}`);
                } else if (orderToRefund.paypalOrderId) {
                    payload.paypalOrderId = orderToRefund.paypalOrderId;
                    console.log(`Frontend: Sending PayPal Order ID for refund: ${orderToRefund.paypalOrderId} (Backend will derive Capture ID)`);
                } else {
                    throw new Error("PayPal Order ID or Capture ID missing for this order. Cannot initiate PayPal refund.");
                }
                endpoint = '/api/refund-paypal';
            } else {
                setRefundMessage(`Refunds for '${orderToRefund.paymentMethod}' are not supported via API.`);
                setIsProcessingRefund(false);
                return;
            }

            console.log('Frontend: Sending refund request to:', endpoint, 'with payload:', payload);

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log('Frontend: Refund API response:', data);

            if (res.ok) {
                setRefundMessage(`Refund successful! New Status: ${data.newStatus || 'N/A'}. Refund ID: ${data.refundId || 'N/A'}`);
                fetchOrders();
                setSelectedOrderId(null);
            } else {
                setRefundMessage(`Refund failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err: unknown) {
            console.error('Frontend: Error during refund:', err);
            if (err instanceof Error) {
                setRefundMessage(`An unexpected error occurred during the refund process: ${err.message}`);
            } else {
                setRefundMessage("An unknown error occurred during the refund process.");
            }
        } finally {
            setIsProcessingRefund(false);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        const orderToCancel = orders.find(order => order.id === orderId);

        if (!orderToCancel) {
            alert("Order not found!");
            return;
        }

        const cancellableStatuses = ['pending', 'completed', 'partially_refunded'];
        if (!cancellableStatuses.includes(orderToCancel.status)) {
            alert(`Cannot cancel order in ${orderToCancel.status} status.`);
            return;
        }

        if (confirm(`Are you sure you want to cancel order #${orderId}? If it's a paid order, this will also attempt a full refund.`)) {
            setIsProcessingRefund(true);
            setRefundMessage(null);
            try {
                const endpoint = '/api/admin/orders/cancel';
                const payload: CancelPayload = { orderId: orderId, reason: 'Order cancellation by admin' };

                const currentTotalAmount = parseFloat(orderToCancel.totalAmount);

                if (orderToCancel.status === 'completed' || orderToCancel.status === 'partially_refunded') {
                    payload.amount = currentTotalAmount;
                    if (orderToCancel.paymentMethod === 'stripe') {
                        if (!orderToCancel.stripePaymentIntentId || !orderToCancel.stripePaymentIntentId.startsWith('pi_')) {
                            throw new Error("Stripe Payment Intent ID (pi_...) missing or invalid for completed order cancellation.");
                        }
                        payload.paymentMethod = 'stripe';
                        payload.paymentIntentId = orderToCancel.stripePaymentIntentId;
                    } else if (orderToCancel.paymentMethod === 'paypal') {
                        if (orderToCancel.paypalCaptureId) {
                            payload.paypalOrderId = orderToCancel.paypalCaptureId;
                            console.log(`Frontend: Sending PayPal Capture ID for cancellation: ${orderToCancel.paypalCaptureId}`);
                        } else if (orderToCancel.paypalOrderId) {
                            payload.paypalOrderId = orderToCancel.paypalOrderId;
                            console.log(`Frontend: Sending PayPal Order ID for cancellation: ${orderToCancel.paypalOrderId} (Backend will derive Capture ID)`);
                        } else {
                            throw new Error("PayPal Order ID or Capture ID missing for completed order cancellation.");
                        }
                        payload.paymentMethod = 'paypal';
                    } else if (orderToCancel.paymentMethod === 'cod') {
                        payload.paymentMethod = 'cod';
                    } else {
                        throw new Error(`Cancellation with refund not supported for '${orderToCancel.paymentMethod}'.`);
                    }
                } else if (orderToCancel.status === 'pending') {
                    payload.paymentMethod = orderToCancel.paymentMethod;
                } else {
                    throw new Error(`Cancellation not supported for '${orderToCancel.paymentMethod}' with status '${orderToCancel.status}'.`);
                }

                console.log('Frontend: Sending cancel request to:', endpoint, 'with payload:', payload);

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                console.log('Frontend: Cancel API response:', data);

                if (res.ok) {
                    setRefundMessage(`Order #${orderId} cancelled successfully! New Status: ${data.newStatus || 'cancelled'}`);
                    fetchOrders();
                } else {
                    setRefundMessage(`Cancellation failed for order #${orderId}: ${data.error || 'Unknown error'}`);
                }
            } catch (err: unknown) {
                console.error('Frontend: Error during cancellation:', err);
                if (err instanceof Error) {
                    setRefundMessage(`An unexpected error occurred during cancellation: ${err.message}`);
                } else {
                    setRefundMessage("An unknown error occurred during cancellation.");
                }
            } finally {
                setIsProcessingRefund(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">↩️ Refund / Cancel Orders</h1>

                {error && (
                    <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                {refundMessage && (
                    <div className={`p-4 mb-4 rounded ${refundMessage.includes('failed') || refundMessage.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {refundMessage}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-gray-600">Loading orders...</p>
                    </div>
                ) : !error && orders.length === 0 ? (
                    <p className="text-gray-600">No orders to display.</p>
                ) : !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Order ID</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Customer</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Payment Method</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Order Date</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Refunded Amount</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 border-b text-gray-800">{order.id}</td>
                                        <td className="py-3 px-4 border-b text-gray-800">{order.customerName}</td>
                                        <td className="py-3 px-4 border-b text-gray-800">${parseFloat(order.totalAmount).toFixed(2)}</td>
                                        <td className="py-3 px-4 border-b text-gray-800 capitalize">{order.paymentMethod}</td>
                                        <td className="py-3 px-4 border-b text-gray-800 capitalize">{order.status.replace('_', ' ')}</td>
                                        <td className="py-3 px-4 border-b text-gray-800">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 border-b text-gray-800">${parseFloat(String(order.refund_amount || 0)).toFixed(2)}</td>
                                        <td className="py-3 px-4 border-b flex space-x-2 items-center">
                                            {/* Refund Button Logic */}
                                            {(order.status === 'completed' || order.status === 'partially_refunded') && order.paymentMethod !== 'cod' &&
                                                (
                                                    (order.paymentMethod === 'stripe' && order.stripePaymentIntentId && order.stripePaymentIntentId.startsWith('pi_')) ||
                                                    (order.paymentMethod === 'paypal' && (order.paypalOrderId || order.paypalCaptureId))
                                                ) ? (
                                                <button
                                                    onClick={() => handleSelectOrderForRefund(order)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                    disabled={isProcessingRefund}
                                                >
                                                    Refund
                                                </button>
                                            ) : null}

                                            {/* Cancel Button Logic */}
                                            {(order.status === 'pending' || order.status === 'completed' || order.status === 'partially_refunded') &&
                                                order.status !== 'cancelled' && order.status !== 'refunded' ? (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                                                    disabled={isProcessingRefund}
                                                >
                                                    Cancel
                                                </button>
                                            ) : null}

                                            {/* N/A for actions if neither refund nor cancel buttons are shown */}
                                            {
                                                !(
                                                    ((order.status === 'completed' || order.status === 'partially_refunded') &&
                                                        order.paymentMethod !== 'cod' &&
                                                        ((order.paymentMethod === 'stripe' && order.stripePaymentIntentId && order.stripePaymentIntentId.startsWith('pi_')) ||
                                                            (order.paymentMethod === 'paypal' && (order.paypalOrderId || order.paypalCaptureId))
                                                        )
                                                    ) || (
                                                        (order.status === 'pending' || order.status === 'completed' || order.status === 'partially_refunded') &&
                                                        order.status !== 'cancelled' && order.status !== 'refunded'
                                                    )
                                                ) ? (
                                                    <span className="text-gray-500">N/A</span>
                                                ) : null
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedOrderId && (
                    <div className="mt-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Process Refund for Order #{selectedOrderId}</h2>
                        {orders.find(o => o.id === selectedOrderId)?.refund_amount > 0 && (
                            <p className="mb-2 text-gray-700">
                                Previously Refunded Amount: ${parseFloat(String(orders.find(o => o.id === selectedOrderId)?.refund_amount || 0)).toFixed(2)}
                            </p>
                        )}
                        <div className="mb-4">
                            <label htmlFor="refundAmount" className="block text-gray-700 text-sm font-bold mb-2">
                                Amount to Refund ($):
                            </label>
                            <input
                                type="number"
                                id="refundAmount"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                step="0.01"
                                min="0.01"
                                max={parseFloat(orders.find(o => o.id === selectedOrderId)?.totalAmount || '0') || 0}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="refundReason" className="block text-gray-700 text-sm font-bold mb-2">
                                Reason:
                            </label>
                            <select
                                id="refundReason"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value as 'duplicate' | 'fraudulent' | 'requested_by_customer' | '')}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Select a reason (required for Stripe)</option>
                                <option value="requested_by_customer">Requested by customer</option>
                                <option value="duplicate">Duplicate</option>
                                <option value="fraudulent">Fraudulent</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => setSelectedOrderId(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                                disabled={isProcessingRefund || !refundReason}
                            >
                                {isProcessingRefund ? 'Processing...' : 'Confirm Refund'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
