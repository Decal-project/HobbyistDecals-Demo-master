import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const { rows } = await client.query(`
      SELECT 
        id,
        total_amount,
        payment_method,
        created_at,
        TO_CHAR(created_at, 'Day') AS weekday,
        TO_CHAR(created_at, 'Month') AS month
      FROM checkout_orders
      ORDER BY created_at DESC
    `);

    client.release();

    return NextResponse.json({ transactions: rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
