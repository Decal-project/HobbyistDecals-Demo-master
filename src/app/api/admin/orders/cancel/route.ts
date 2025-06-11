import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Using pg.Pool from your lib/db
import pg from 'pg'; // Import pg for PoolClient type

export async function POST(request: Request) {
    let client: pg.PoolClient | null = null; // Declare client outside try block for finally access
    try {
        const { orderId, reason } = await request.json(); // We only need orderId and reason here

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        client = await pool.connect(); // Acquire a client from the connection pool
        await client.query('BEGIN'); // Start a database transaction
        console.log('Database transaction started for Order Cancellation.');

        // Fetch the order details, locking the row to prevent race conditions during update
        const orderResult = await client.query(
            `SELECT id, total_amount, payment_method, status, stripe_session_id, paypal_order_id, affiliate_user_id
             FROM checkout_orders WHERE id = $1 FOR UPDATE`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK'); // Rollback if order not found
            console.warn(`Order Cancellation: Order ${orderId} not found. Rolling back transaction.`);
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const dbOrder = orderResult.rows[0];
        // Map database snake_case columns to camelCase for consistency with frontend expectations
        const order = {
            id: dbOrder.id,
            totalAmount: parseFloat(dbOrder.total_amount), // Ensure totalAmount is a number
            paymentMethod: dbOrder.payment_method,
            status: dbOrder.status,
            stripeSessionId: dbOrder.stripe_session_id,
            paypalOrderId: dbOrder.paypal_order_id,
            affiliateUserId: dbOrder.affiliate_user_id // Include affiliate_user_id
        };

        // --- Logic for Pending Orders (No external refund needed) ---
        if (order.status === 'pending') {
            await client.query(
                `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
                ['cancelled', orderId]
            );
            // No affiliate commission adjustment for pending orders (assuming no commission paid yet)
            await client.query('COMMIT'); // Commit the transaction
            console.log(`Order ${orderId} cancelled. No refund processed as order was pending. Transaction committed.`);
            return NextResponse.json({ message: `Order ${orderId} cancelled.`, newStatus: 'cancelled' });
        }

        // --- Logic for Paid Orders (Requires refund via respective API) ---
        if (order.status === 'completed' || order.status === 'partially_refunded') {
            const refundAmount = order.totalAmount; // For cancellation, assume full refund of remaining amount

            // Determine which refund API to call based on payment method
            let refundApiEndpoint = '';
            let refundPayload: any = { orderId: order.id, amount: refundAmount, reason: reason || 'Order cancellation by admin' };

            if (order.paymentMethod === 'stripe') {
                if (!order.stripeSessionId || !order.stripeSessionId.startsWith('pi_')) {
                    await client.query('ROLLBACK');
                    return NextResponse.json({ error: 'Stripe Payment Intent ID missing or invalid for refund during cancellation.' }, { status: 400 });
                }
                refundApiEndpoint = '/api/refund-stripe'; // Your existing Stripe refund route
                // The frontend no longer sends paymentIntentId directly, the refund-stripe route will retrieve it from session_id
            } else if (order.paymentMethod === 'paypal') {
                if (!order.paypalOrderId) {
                    await client.query('ROLLBACK');
                    return NextResponse.json({ error: 'PayPal Order ID missing for refund during cancellation.' }, { status: 400 });
                }
                refundApiEndpoint = '/api/refund-paypal'; // Your existing PayPal refund route
                // The frontend no longer sends paypalOrderId directly, the refund-paypal route will retrieve it from order_id
            } else if (order.paymentMethod === 'cod') {
                // For COD, if it's 'completed', it means it was paid in cash. No API refund needed.
                // Just update status to 'cancelled'. Refund is handled manually.
                await client.query(
                    `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
                    ['cancelled', orderId]
                );
                // Also adjust affiliate commission if applicable (same logic as in refund routes)
                if (order.affiliateUserId !== null) {
                    const commissionRate = 0.10; // Get actual rate
                    const refundedCommissionAmount = refundAmount * commissionRate;
                    await client.query(
                        `UPDATE affiliate_commissions SET status = 'reversed', updated_at = NOW() WHERE order_id = $1 AND affiliate_user_id = $2`,
                        [orderId, order.affiliateUserId]
                    );
                    await client.query(
                        `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) - $1 WHERE user_id = $2`,
                        [refundedCommissionAmount, order.affiliateUserId]
                    );
                }
                await client.query('COMMIT');
                return NextResponse.json({ message: `Order ${orderId} cancelled. Manual refund/reversal required for COD.`, newStatus: 'cancelled' });
            } else {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: `Cancellation with refund not supported for '${order.paymentMethod}'.` }, { status: 400 });
            }

            console.log(`Calling refund API: ${refundApiEndpoint} with payload:`, refundPayload);

            // Call the appropriate internal refund API route
            const refundResponse = await fetch(`http://localhost:3000${refundApiEndpoint}`, { // Adjust URL for production
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refundPayload),
            });

            const refundResult = await refundResponse.json();

            if (refundResponse.ok) {
                // The refund API handles DB updates for status and affiliate commission, and commits its own transaction.
                // So, we just commit this parent transaction (which only has the SELECT FOR UPDATE)
                await client.query('COMMIT');
                console.log(`Order ${orderId} cancelled and refunded via ${order.paymentMethod}. Transaction committed.`);
                return NextResponse.json({
                    message: `Order ${orderId} cancelled and refunded.`,
                    newStatus: refundResult.newStatus || 'refunded', // Use status from refund API
                    refundId: refundResult.refundId
                });
            } else {
                await client.query('ROLLBACK'); // Rollback if refund API call failed
                console.error(`Failed to process refund for order ${orderId} via ${order.paymentMethod} API:`, refundResult);
                return NextResponse.json({ error: `Failed to process refund during cancellation: ${refundResult.error || 'Unknown error'}`, details: refundResult.details }, { status: refundResponse.status || 500 });
            }
        }

        // Fallback for unexpected statuses or if no specific logic matched
        await client.query('ROLLBACK'); // Rollback if no path was taken
        return NextResponse.json({ error: 'Order status not eligible for cancellation or refund via this route.', currentStatus: order.status }, { status: 400 });

    } catch (error: any) {
        // If an error occurred, roll back the transaction
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error during Order Cancellation.');
            } catch (rollbackError) {
                console.error('Error during rollback for Order Cancellation:', rollbackError);
            }
        }
        console.error('--- Order Cancellation route FATAL error:', error);
        return NextResponse.json(
            { error: 'Failed to process order cancellation', details: error.message || 'An unknown error occurred' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
            console.log('Database client released for Order Cancellation.');
        }
    }
}