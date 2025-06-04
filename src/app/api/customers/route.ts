import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    const loggedInOnly = req.nextUrl.searchParams.get('loggedIn') === 'true';

    const query = `
      SELECT
        o.billing_email AS email,
        MAX(COALESCE(NULLIF(o.billing_first_name, ''), SPLIT_PART(o.billing_email, '@', 1))) AS name,
        MAX(o.billing_phone) AS contact
      FROM checkout_orders o
      ${loggedInOnly ? 'INNER JOIN auth_users au ON o.billing_email = au.email' : ''}
      WHERE o.billing_email IS NOT NULL
      GROUP BY o.billing_email
      ORDER BY name ASC
      LIMIT 100;
    `;

    const { rows } = await client.query(query);
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
