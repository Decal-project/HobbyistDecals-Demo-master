import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch customer loyalty info with stats
export async function GET() {
  try {
    const query = `
      WITH cart_item_totals AS (
        SELECT
          cart_id,
          SUM(quantity) AS total_products
        FROM cart_items
        GROUP BY cart_id
      ),
      products_summary AS (
        SELECT
          c.id AS cart_id,
          COALESCE(SUM(ci.quantity), 0) AS total_products
        FROM carts c
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        GROUP BY c.id
      ),
      orders_summary AS (
        SELECT
          o.billing_email AS email,
          MAX(COALESCE(NULLIF(o.billing_first_name, ''), SPLIT_PART(o.billing_email, '@', 1))) AS customer_name,
          MAX(o.billing_phone) AS phone,
          COUNT(DISTINCT o.id) AS orders_count,
          SUM(DISTINCT o.total_amount) AS total_spent,
          MAX(o.created_at) AS last_order_date
        FROM checkout_orders o
        GROUP BY o.billing_email
      ),
      customer_products AS (
        SELECT
          o.billing_email,
          SUM(COALESCE(ps.total_products, 0)) AS total_products
        FROM checkout_orders o
        JOIN carts c ON o.cart_id = c.id
        LEFT JOIN products_summary ps ON c.id = ps.cart_id
        GROUP BY o.billing_email
      )
      SELECT
        os.email,
        os.customer_name,
        os.phone,
        os.orders_count,
        COALESCE(cp.total_products, 0) AS total_products,
        os.total_spent,
        ld.discount_percent,
        ld.from_date,
        ld.to_date
      FROM orders_summary os
      LEFT JOIN customer_products cp ON os.email = cp.billing_email
      LEFT JOIN loyalty_discounts ld ON ld.email = os.email
      ORDER BY os.last_order_date DESC
      LIMIT 100;
    `;

    const { rows } = await pool.query(query);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Loyalty fetch error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST: Add or update loyalty discount
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, discount_percent, from_date, to_date } = body;

    const query = `
      INSERT INTO loyalty_discounts (email, discount_percent, from_date, to_date, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (email) DO UPDATE
      SET discount_percent = EXCLUDED.discount_percent,
          from_date = EXCLUDED.from_date,
          to_date = EXCLUDED.to_date,
          updated_at = NOW();
    `;

    await pool.query(query, [email, discount_percent, from_date, to_date]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Loyalty update error:', err);
    return NextResponse.json({ error: 'Failed to update loyalty discount' }, { status: 500 });
  }
}
