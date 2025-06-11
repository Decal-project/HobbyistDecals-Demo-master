// src/app/api/refund-stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db'; // Assuming '@/lib/db' exports a pg.Pool instance
import pg from 'pg'; // Import pg for Client type

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // You mentioned you already updated this, but confirm it's a recent stable version.
    // E.g., '2024-06-20' is a good recent example.
    apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    let client: pg.PoolClient | null = null; // Declare client outside try block
    try {
        const { orderId, amount, reason } = await req.json(); // frontend now sends orderId and amount

        if (!orderId || !amount) {
            return NextResponse.json({ error: 'Order ID and amount are required.' }, { status: 400 });
        }

        client = await pool.connect(); // Acquire a client from the connection pool
        await client.query('BEGIN'); // Start a database transaction
        console.log('Database transaction started for Stripe refund.');

        // 1. Get order details from your DB to find the Stripe Payment Intent ID and current refund amount
        const { rows } = await client.query(
            `SELECT payment_intent_id, total_amount, status, affiliate_user_id, COALESCE(refund_amount, 0) as current_refund_amount
             FROM checkout_orders WHERE id = $1 FOR UPDATE`,
            [orderId]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Order ${orderId} not found. Rolling back transaction.`);
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const order = rows[0];
        const paymentIntentIdFromDB = order.payment_intent_id; // Get the payment intent ID directly
        const affiliateUserId = order.affiliate_user_id;
        const totalAmount = parseFloat(order.total_amount);
        const currentRefundAmount = parseFloat(order.current_refund_amount);
        const remainingRefundableAmount = totalAmount - currentRefundAmount;

        // Validate the paymentIntentIdFromDB before proceeding
        if (!paymentIntentIdFromDB || !paymentIntentIdFromDB.startsWith('pi_')) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Invalid or missing Payment Intent ID for order ${orderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Invalid or missing Stripe Payment Intent ID for this order.' }, { status: 400 });
        }

        // Validate the requested refund amount
        if (parseFloat(amount) <= 0) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Refund amount must be greater than zero for order ${orderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Refund amount must be greater than zero.' }, { status: 400 });
        }

        if (parseFloat(amount) > remainingRefundableAmount) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Refund amount exceeds remaining balance for order ${orderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Refund amount exceeds the remaining refundable amount.' }, { status: 400 });
        }

        // Amount to refund (Stripe expects cents)
        const refundAmountCents = Math.round(parseFloat(amount) * 100);

        // 2. Initiate the refund with Stripe using the direct Payment Intent ID
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentIdFromDB, // Directly use the pi_ ID from DB
            amount: refundAmountCents, // Amount in cents
            reason: reason || 'requested_by_customer',
            metadata: {
                order_id: String(orderId),
            },
            // >>>>>>>>>>>>>>>>>>>>>>> IMPORTANT <<<<<<<<<<<<<<<<<<<<<<<<<
            // This line is commented out as a diagnostic step to bypass the 'idempotency_key' error.
            // Leaving this out is NOT recommended for production, as it can lead to duplicate refunds.
            // idempotency_key: `refund-${orderId}-${Date.now()}`
        });

        // 3. Update your database with the refund status and refund_amount
        let newStatus = order.status; // Initialize with the current status
        const newTotalRefundedAmount = currentRefundAmount + parseFloat(amount);

        if (refund.status === 'succeeded') {
            if (newTotalRefundedAmount.toFixed(2) === totalAmount.toFixed(2)) {
                newStatus = 'refunded';
            } else if (newTotalRefundedAmount > 0) {
                newStatus = 'partially_refunded';
            }
        } else if (refund.status === 'pending') {
            newStatus = 'pending_refund';
        } else {
            console.warn(`Stripe Refund: Unexpected refund status from Stripe API: ${refund.status}`);
            newStatus = 'refund_processing_error';
        }

        await client.query(
            `UPDATE checkout_orders SET status = $1, refund_amount = $2, updated_at = NOW() WHERE id = $3`,
            [newStatus, newTotalRefundedAmount, orderId]
        );
        console.log(`DB: Order ${orderId} status updated to ${newStatus}. Refund amount updated to ${newTotalRefundedAmount}.`);

        // 4. Adjust affiliate commission
        if (affiliateUserId !== null) {
            console.log(`Stripe Refund: Adjusting commission for affiliate ${affiliateUserId} on order ${orderId}.`);
            const commissionRate = 0.10; // TODO: Retrieve actual commission rate from affiliate_commissions table
            const refundedCommissionAmount = parseFloat(amount) * commissionRate;

            // Mark the specific commission record for this order as 'reversed' or 'refunded'
            await client.query(
                `UPDATE affiliate_commissions SET status = 'reversed', updated_at = NOW() WHERE order_id = $1 AND affiliate_user_id = $2`,
                [orderId, affiliateUserId]
            );
            // Deduct from affiliate's total earnings
            await client.query(
                `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) - $1 WHERE user_id = $2`,
                [refundedCommissionAmount, affiliateUserId]
            );
            console.log(`DB: Affiliate commission for order ${orderId} reversed and earnings adjusted by -$${refundedCommissionAmount.toFixed(2)}.`);
        }

        await client.query('COMMIT');
        console.log(`Stripe refund for order ${orderId} (Refund ID: ${refund.id}) successful. Transaction committed.`);
        return NextResponse.json({ success: true, refundId: refund.id, newStatus });

    } catch (error: any) {
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error during Stripe refund.');
            } catch (rollbackError) {
                console.error('Error during rollback for Stripe refund:', rollbackError);
            }
        }
        console.error('--- Stripe Refund route FATAL error:', error);
        if (error.type) console.error('Stripe Error Type:', error.type);
        if (error.statusCode) console.error('Stripe Status Code:', error.statusCode);
        if (error.raw && error.raw.message) console.error('Stripe Raw Message:', error.raw.message);
        return NextResponse.json(
            { error: 'Failed to process Stripe refund', details: error.message || 'An unknown error occurred' },
            { status: error.statusCode || 500 }
        );
    } finally {
        if (client) {
            client.release();
            console.log('Database client released for Stripe refund.');
        }
    }
}
