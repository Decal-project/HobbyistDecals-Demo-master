import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
    SELECT 
  c.id AS cart_id,
  c.created_at,
  COUNT(ci.id) AS items_in_cart,
  o.billing_email AS order_email 
FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
LEFT JOIN checkout_orders o ON o.cart_id = c.id
WHERE c.id NOT IN (SELECT cart_id FROM checkout_orders)
GROUP BY c.id, c.created_at, o.billing_email
ORDER BY c.created_at DESC
LIMIT 20;



    `;

    const { rows } = await client.query(query);
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
