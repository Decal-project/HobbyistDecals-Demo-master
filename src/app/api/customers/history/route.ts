import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch customer summaries (group by email only to avoid duplicates)
    const summaryQuery = `
      SELECT
        o.billing_email AS email,
        MAX(COALESCE(NULLIF(o.billing_first_name, ''), SPLIT_PART(o.billing_email, '@', 1))) AS customer_name,
        MAX(o.billing_phone) AS contact,
        COUNT(o.id) AS orders_count,
        SUM(o.total_amount) AS total_spent,
        MAX(o.created_at) AS last_order_date
      FROM checkout_orders o
      GROUP BY o.billing_email
      ORDER BY last_order_date DESC
      LIMIT 50;
    `;
    const summaryResult = await pool.query(summaryQuery);

    if (summaryResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch all orders for the above emails
    const emails = summaryResult.rows.map(row => `'${row.email}'`).join(',');
    const ordersQuery = `
      SELECT
        o.billing_email AS email,
        o.id AS order_id,
        o.total_amount,
        o.created_at,
        STRING_AGG(ci.name, ', ') AS products_ordered
      FROM checkout_orders o
      JOIN carts c ON o.cart_id = c.id
      JOIN cart_items ci ON ci.cart_id = c.id
      WHERE o.billing_email IN (${emails})
      GROUP BY o.billing_email, o.id, o.total_amount, o.created_at
      ORDER BY o.created_at DESC;
    `;
    const ordersResult = await pool.query(ordersQuery);

    // 3. Nest each customer's orders by email
    const summaryWithOrders = summaryResult.rows.map(customer => ({
      ...customer,
      orders: ordersResult.rows.filter(order => order.email === customer.email),
    }));

    return NextResponse.json(summaryWithOrders);
  } catch (error) {
    console.error('Error fetching customer order history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
