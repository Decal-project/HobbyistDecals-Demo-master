// src/app/api/admin/failed-transactions/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust path if necessary

export async function GET(req: Request) {
    try {
        // You might want to add authentication/authorization here
        // to ensure only admins can access this route.

        // Option A: Get failed/canceled Stripe Payments
        const { rows: stripeFailedPayments } = await pool.query(
            `SELECT
                sp.id AS payment_id,
                sp.order_id,
                sp.amount,
                sp.currency, -- Assuming stripe_payments table has currency
                sp.status AS payment_status,
                sp.created_at AS payment_created_at,
                co.billing_email,
                co.billing_first_name,
                co.billing_last_name
            FROM stripe_payments sp
            JOIN checkout_orders co ON sp.order_id = co.id
            WHERE sp.status = 'failed' OR sp.status = 'canceled' OR (sp.status = 'pending' AND sp.created_at < NOW() - INTERVAL '1 hour')
            ORDER BY sp.created_at DESC`
        );

        // Option B: Get checkout_orders that are still 'pending' and are old (general)
        // Removed 'currency' as it doesn't exist in checkout_orders table.
        const { rows: generalPendingOrders } = await pool.query(
            `SELECT
                id AS order_id,
                total_amount AS amount,
                payment_method,
                billing_email,
                billing_first_name,
                billing_last_name,
                created_at AS order_created_at,
                status AS order_status
            FROM checkout_orders
            WHERE status = 'pending'
              AND created_at < NOW() - INTERVAL '1 hour'
              AND payment_method <> 'stripe'
              AND payment_method <> 'paypal'
            ORDER BY created_at DESC`
        );

        // Option C: Get PayPal orders that are still 'pending' and are old
        // Removed 'currency' as it doesn't exist in checkout_orders table.
        const { rows: paypalPendingOrders } = await pool.query(
            `SELECT
                id AS order_id,
                total_amount AS amount,
                payment_method,
                billing_email,
                billing_first_name,
                billing_last_name,
                created_at AS order_created_at,
                status AS order_status,
                paypal_order_id,
                paypal_payer_id
            FROM checkout_orders
            WHERE status = 'pending'
              AND payment_method = 'paypal'
              AND created_at < NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC`
        );

        return NextResponse.json({
            stripeFailedPayments,
            generalPendingOrders,
            paypalPendingOrders
        });

    } catch (error) {
        console.error("Error fetching failed transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch failed transactions." },
            { status: 500 }
        );
    }
}