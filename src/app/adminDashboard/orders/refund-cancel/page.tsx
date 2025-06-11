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
    // IMPORTANT: This now maps to your 'payment_intent_id' column from checkout_orders
    stripePaymentIntentId?: string;
    // Keeping stripeSessionId if it's sent by the backend for other display/debug purposes,
    // but the refund logic will primarily use stripePaymentIntentId
    stripeSessionId?: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
}

// Define types for API payloads to avoid using 'any'
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
    paymentMethod: string;
    paymentIntentId?: string;
    paypalOrderId?: string;
}


export default function RefundCancelOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    // >>>>>>>>>>>>>> UPDATED: Type and initial state for refundReason <<<<<<<<<<<<<<<<
    const [refundReason, setRefundReason] = useState<'duplicate' | 'fraudulent' | 'requested_by_customer' | ''>('');
    const [isProcessingRefund, setIsProcessingRefund] = useState(false);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);

    // Encapsulate fetchOrders in useCallback for better performance and to use in useEffect
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous page-level errors
            setRefundMessage(null); // Clear any previous messages

            const response = await fetch('/api/admin/orders'); // Your API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            console.log('Frontend: Raw data from /api/admin/orders:', rawData);

            // Ensure rawData is treated as an array of Order objects directly
            const ordersArray: Order[] = Array.isArray(rawData) ? rawData : Object.values(rawData) as Order[];
            console.log('Frontend: Converted orders array:', ordersArray);

            setOrders(ordersArray);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error("Frontend: Failed to fetch orders:", errorMessage);
            setError(`Failed to load orders. Please try again. Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // Dependency on fetchOrders

    const handleSelectOrderForRefund = (order: Order) => {
        setSelectedOrderId(order.id);
        // Default to full refund, parse to number. Handle cases where totalAmount might be string "0.00"
        setRefundAmount(parseFloat(order.totalAmount) || 0);
        setRefundReason(''); // Reset reason when selecting a new order
        setRefundMessage(null); // Clear previous messages
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

        // >>>>>>>>>>>>>> ADDED: Validation for refundReason <<<<<<<<<<<<<<<<
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
                reason: refundReason, // This will now be one of Stripe's allowed values
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
                fetchOrders(); // Re-fetch orders to update the table
                setSelectedOrderId(null); // Close refund modal
            } else {
                setRefundMessage(`Refund failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Frontend: Error during refund:', errorMessage);
            setRefundMessage(`An unexpected error occurred during the refund process: ${errorMessage}`);
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
                const payload: Partial<CancelPayload> = { orderId: orderId, reason: 'Order cancellation by admin' };

                const currentTotalAmount = parseFloat(orderToCancel.totalAmount);

                if (orderToCancel.status === 'completed' || orderToCancel.status === 'partially_refunded') {
                    payload.amount = currentTotalAmount; // Full refund on cancellation
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
                        payload.paymentMethod = 'cod'; // COD orders can be cancelled without an API refund
                    } else {
                        throw new Error(`Cancellation with refund not supported for '${orderToCancel.paymentMethod}'.`);
                    }
                } else if (orderToCancel.status === 'pending') {
                    payload.paymentMethod = orderToCancel.paymentMethod; // No refund needed if pending
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
                    fetchOrders(); // Re-fetch orders to update the table
                } else {
                    setRefundMessage(`Cancellation failed for order #${orderId}: ${data.error || 'Unknown error'}`);
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error('Frontend: Error during cancellation:', errorMessage);
                setRefundMessage(`An unexpected error occurred during cancellation: ${errorMessage}`);
            } finally {
                setIsProcessingRefund(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">↩️ Refund / Cancel Orders</h1>

                {/* Display page-level fetch errors */}
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
                ) : !error && orders.length === 0 ? ( // Added !error to not show "No orders" if there was a fetch error
                    <p className="text-gray-600">No orders to display.</p>
                ) : (
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
                                        <td className="py-3 px-4 border-b flex space-x-2 items-center">
                                            {/* Refund Button Logic */}
                                            {
                                                (order.status === 'completed' || order.status === 'partially_refunded') &&
                                                (
                                                    (order.paymentMethod === 'stripe' && order.stripePaymentIntentId && order.stripePaymentIntentId.startsWith('pi_')) ||
                                                    (order.paymentMethod === 'paypal' && (order.paypalOrderId || order.paypalCaptureId))
                                                ) &&
                                                order.paymentMethod !== 'cod' ? (
                                                    <button
                                                        onClick={() => handleSelectOrderForRefund(order)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                        disabled={isProcessingRefund}
                                                    >
                                                        Refund
                                                    </button>
                                                ) : null
                                            }

                                            {/* Cancel Button Logic */}
                                            {
                                                (order.status === 'pending' || order.status === 'completed' || order.status === 'partially_refunded') &&
                                                order.status !== 'cancelled' && order.status !== 'refunded' ? (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                                                        disabled={isProcessingRefund}
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : null
                                            }

                                            {/* No Actions (if neither Refund nor Cancel is applicable) */}
                                            {
                                                !(
                                                    ((order.status === 'completed' || order.status === 'partially_refunded') &&
                                                    ((order.paymentMethod === 'stripe' && order.stripePaymentIntentId && order.stripePaymentIntentId.startsWith('pi_')) ||
                                                    (order.paymentMethod === 'paypal' && (order.paypalOrderId || order.paypalCaptureId)))) &&
                                                    order.paymentMethod !== 'cod'
                                                ) &&
                                                !(
                                                    (order.status === 'pending' || order.status === 'completed' || order.status === 'partially_refunded') &&
                                                    order.status !== 'cancelled' && order.status !== 'refunded'
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
                            {/* >>>>>>>>>>>>>> CHANGED TO SELECT DROPDOWN <<<<<<<<<<<<<<<< */}
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
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                // >>>>>>>>>>>>>> DISABLED BUTTON IF NO REASON SELECTED <<<<<<<<<<<<<<<<
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
