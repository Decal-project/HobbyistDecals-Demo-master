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
    const { orderId, amount, reason } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Order ID and amount are required.' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    console.log('Database transaction started for Stripe refund.');

    const { rows } = await client.query(
      `SELECT payment_intent_id, total_amount, status, affiliate_user_id, COALESCE(refund_amount, 0) as current_refund_amount
       FROM checkout_orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const order = rows[0];
    const paymentIntentIdFromDB = order.payment_intent_id;
    const affiliateUserId = order.affiliate_user_id;
    const totalAmount = parseFloat(order.total_amount);
    const currentRefundAmount = parseFloat(order.current_refund_amount);
    const remainingRefundableAmount = totalAmount - currentRefundAmount;

    if (!paymentIntentIdFromDB || !paymentIntentIdFromDB.startsWith('pi_')) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Invalid or missing Stripe Payment Intent ID for this order.' }, { status: 400 });
    }

    if (parseFloat(amount) <= 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Refund amount must be greater than zero.' }, { status: 400 });
    }

    if (parseFloat(amount) > remainingRefundableAmount) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Refund amount exceeds the remaining refundable amount.' }, { status: 400 });
    }

    const refundAmountCents = Math.round(parseFloat(amount) * 100);

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentIdFromDB,
      amount: refundAmountCents,
      reason: reason || 'requested_by_customer',
      metadata: {
        order_id: String(orderId),
      },
    });

    let newStatus = order.status;
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

    if (affiliateUserId !== null) {
      const commissionRate = 0.10; // Optional: fetch from DB
      const refundedCommissionAmount = parseFloat(amount) * commissionRate;

      await client.query(
        `UPDATE affiliate_commissions SET status = 'reversed', updated_at = NOW() WHERE order_id = $1 AND affiliate_user_id = $2`,
        [orderId, affiliateUserId]
      );

      await client.query(
        `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) - $1 WHERE user_id = $2`,
        [refundedCommissionAmount, affiliateUserId]
      );
    }

    await client.query('COMMIT');
    console.log(`Stripe refund for order ${orderId} (Refund ID: ${refund.id}) successful.`);

    return NextResponse.json({ success: true, refundId: refund.id, newStatus });

  } catch (error: unknown) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback for Stripe refund:', rollbackError);
      }
    }

    console.error('--- Stripe Refund route FATAL error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe Error Type:', error.type);
      console.error('Stripe Status Code:', error.statusCode);
      console.error('Stripe Raw Message:', error.raw?.message);
      return NextResponse.json(
        { error: 'Stripe refund failed', details: error.message },
        { status: error.statusCode || 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to process Stripe refund', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error during refund processing.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
