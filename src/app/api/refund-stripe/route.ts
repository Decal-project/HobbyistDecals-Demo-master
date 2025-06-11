// src/app/api/refund-stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';
import pg from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    let client: pg.PoolClient | null = null;

    try {
        const { orderId, amount, reason }: { orderId: string; amount: number; reason?: string } = await req.json();

        if (!orderId || !amount) {
            return NextResponse.json({ error: 'Order ID and amount are required.' }, { status: 400 });
        }

        client = await pool.connect();
        await client.query('BEGIN');
        console.log('Database transaction started for Stripe refund.');

        const { rows } = await client.query(
            `SELECT payment_intent_id, total_amount, status, affiliate_user_id FROM checkout_orders WHERE id = $1 FOR UPDATE`,
            [orderId]
        );

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Order ${orderId} not found. Rolling back transaction.`);
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const order = rows[0];
        const paymentIntentIdFromDB: string = order.payment_intent_id;
        const affiliateUserId: string | null = order.affiliate_user_id;

        if (!paymentIntentIdFromDB || !paymentIntentIdFromDB.startsWith('pi_')) {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Invalid or missing Payment Intent ID for order ${orderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Invalid or missing Stripe Payment Intent ID for this order.' }, { status: 400 });
        }

        if (order.status === 'refunded' || order.status === 'partially_refunded') {
            await client.query('ROLLBACK');
            console.warn(`Stripe Refund: Order ${orderId} already ${order.status}. Rolling back transaction.`);
            return NextResponse.json({ error: `Order already ${order.status}.` }, { status: 400 });
        }

        const refundAmountCents = Math.round(parseFloat(amount.toString()) * 100);
        const orderTotalAmountCents = Math.round(parseFloat(order.total_amount) * 100);

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentIdFromDB,
            amount: refundAmountCents,
            reason: reason || 'requested_by_customer',
            metadata: {
                order_id: String(orderId),
            },
        });

        let newStatus = 'refunded';
        if (refund.status === 'succeeded') {
            newStatus = refundAmountCents < orderTotalAmountCents ? 'partially_refunded' : 'refunded';
        } else if (refund.status === 'pending') {
            newStatus = 'pending_refund';
        } else {
            console.warn(`Stripe Refund: Unexpected refund status from Stripe API: ${refund.status}`);
            newStatus = 'refund_processing_error';
        }

        await client.query(
            `UPDATE checkout_orders SET status = $1, refund_amount = COALESCE(refund_amount, 0) + $2, updated_at = NOW() WHERE id = $3`,
            [newStatus, parseFloat(amount.toString()), orderId]
        );
        console.log(`DB: Order ${orderId} status updated to ${newStatus}.`);

        if (affiliateUserId !== null) {
            console.log(`Stripe Refund: Adjusting commission for affiliate ${affiliateUserId} on order ${orderId}.`);
            const commissionRate = 0.10; // Retrieve from DB if needed
            const refundedCommissionAmount = parseFloat(amount.toString()) * commissionRate;

            await client.query(
                `UPDATE affiliate_commissions SET status = 'reversed', updated_at = NOW() WHERE order_id = $1 AND affiliate_user_id = $2`,
                [orderId, affiliateUserId]
            );

            await client.query(
                `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) - $1 WHERE user_id = $2`,
                [refundedCommissionAmount, affiliateUserId]
            );
            console.log(`DB: Affiliate commission for order ${orderId} reversed and earnings adjusted by -$${refundedCommissionAmount.toFixed(2)}.`);
        }

        await client.query('COMMIT');
        console.log(`Stripe refund for order ${orderId} (Refund ID: ${refund.id}) successful. Transaction committed.`);

        return NextResponse.json({ success: true, refundId: refund.id, newStatus });

    } catch (error: unknown) {
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error during Stripe refund.');
            } catch (rollbackError) {
                console.error('Error during rollback for Stripe refund:', rollbackError);
            }
        }

        if (error instanceof Stripe.errors.StripeError) {
            console.error('Stripe Error:', error.message);
            return NextResponse.json(
                { error: 'Failed to process Stripe refund', details: error.message },
                { status: error.statusCode || 500 }
            );
        }

        if (error instanceof Error) {
            console.error('Unhandled Error:', error.message);
            return NextResponse.json(
                { error: 'Unexpected error during Stripe refund', details: error.message },
                { status: 500 }
            );
        }

        console.error('Unknown error type during Stripe refund:', error);
        return NextResponse.json(
            { error: 'Unknown error during Stripe refund' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
            console.log('Database client released for Stripe refund.');
        }
    }
}
