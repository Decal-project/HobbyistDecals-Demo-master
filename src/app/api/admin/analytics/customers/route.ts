import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT
        o.billing_email AS customer_id,
        MAX(COALESCE(NULLIF(o.billing_first_name, ''), SPLIT_PART(o.billing_email, '@', 1))) AS customer_name,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(ci.quantity), 0) AS total_units_bought
      FROM checkout_orders o
      LEFT JOIN carts c ON o.cart_id = c.id
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      WHERE o.billing_email IS NOT NULL
      GROUP BY o.billing_email
      ORDER BY total_orders DESC, total_units_bought DESC
      LIMIT 20;
    `;

    const { rows } = await client.query(query);
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching most active customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
