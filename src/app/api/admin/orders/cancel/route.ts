import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import pg from 'pg';

type RefundPayload = {
  orderId: string;
  amount: number;
  reason: string;
};

export async function POST(request: Request) {
  let client: pg.PoolClient | null = null;

  try {
    const { orderId, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    console.log('Database transaction started for Order Cancellation.');

    const orderResult = await client.query(
      `SELECT id, total_amount, payment_method, status, stripe_session_id, paypal_order_id, affiliate_user_id
       FROM checkout_orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.warn(`Order Cancellation: Order ${orderId} not found. Rolling back transaction.`);
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const dbOrder = orderResult.rows[0];
    const order = {
      id: dbOrder.id,
      totalAmount: parseFloat(dbOrder.total_amount),
      paymentMethod: dbOrder.payment_method,
      status: dbOrder.status,
      stripeSessionId: dbOrder.stripe_session_id,
      paypalOrderId: dbOrder.paypal_order_id,
      affiliateUserId: dbOrder.affiliate_user_id
    };

    if (order.status === 'pending') {
      await client.query(
        `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
        ['cancelled', orderId]
      );
      await client.query('COMMIT');
      console.log(`Order ${orderId} cancelled. No refund processed as order was pending. Transaction committed.`);
      return NextResponse.json({ message: `Order ${orderId} cancelled.`, newStatus: 'cancelled' });
    }

    if (order.status === 'completed' || order.status === 'partially_refunded') {
      const refundAmount = order.totalAmount;
      let refundApiEndpoint = '';
      const refundPayload: RefundPayload = {
        orderId: order.id,
        amount: refundAmount,
        reason: reason || 'Order cancellation by admin'
      };

      if (order.paymentMethod === 'stripe') {
        if (!order.stripeSessionId || !order.stripeSessionId.startsWith('pi_')) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Stripe Payment Intent ID missing or invalid for refund during cancellation.' }, { status: 400 });
        }
        refundApiEndpoint = '/api/refund-stripe';
      } else if (order.paymentMethod === 'paypal') {
        if (!order.paypalOrderId) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'PayPal Order ID missing for refund during cancellation.' }, { status: 400 });
        }
        refundApiEndpoint = '/api/refund-paypal';
      } else if (order.paymentMethod === 'cod') {
        await client.query(
          `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
          ['cancelled', orderId]
        );

        if (order.affiliateUserId !== null) {
          const commissionRate = 0.10;
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

      const refundResponse = await fetch(`http://localhost:3000${refundApiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundPayload),
      });

      const refundResult: {
        newStatus?: string;
        refundId?: string;
        error?: string;
        details?: string;
      } = await refundResponse.json();

      if (refundResponse.ok) {
        await client.query('COMMIT');
        console.log(`Order ${orderId} cancelled and refunded via ${order.paymentMethod}. Transaction committed.`);
        return NextResponse.json({
          message: `Order ${orderId} cancelled and refunded.`,
          newStatus: refundResult.newStatus || 'refunded',
          refundId: refundResult.refundId
        });
      } else {
        await client.query('ROLLBACK');
        console.error(`Failed to process refund for order ${orderId} via ${order.paymentMethod} API:`, refundResult);
        return NextResponse.json(
          {
            error: `Failed to process refund during cancellation: ${refundResult.error || 'Unknown error'}`,
            details: refundResult.details,
          },
          { status: refundResponse.status || 500 }
        );
      }
    }

    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Order status not eligible for cancellation or refund via this route.', currentStatus: order.status }, { status: 400 });

  } catch (error: unknown) {
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.error('Database transaction rolled back due to error during Order Cancellation.');
      } catch (rollbackError) {
        console.error('Error during rollback for Order Cancellation:', rollbackError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('--- Order Cancellation route FATAL error:', error);
    return NextResponse.json(
      { error: 'Failed to process order cancellation', details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('Database client released for Order Cancellation.');
    }
  }
}
