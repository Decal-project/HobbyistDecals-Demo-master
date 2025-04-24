import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT payment_email FROM affiliate_users WHERE id = $1',
    [1]  // Replace with real session user
  );
  return NextResponse.json({ paymentEmail: rows[0]?.payment_email || '' });
}

export async function POST(req: Request) {
  const { paymentEmail } = await req.json();
  if (!paymentEmail) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  await pool.query(
    'UPDATE affiliate_users SET payment_email = $1 WHERE id = $2',
    [paymentEmail, 1] // Replace 1 with real session user
  );

  return NextResponse.json({ success: true });
}
