// app/api/coupons/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code missing' }, { status: 400 });
    }

    // Query the database for the coupon
    const result = await pool.query(
      'SELECT discount_percent FROM discount_codes WHERE code = $1 LIMIT 1',
      [code.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const discount = result.rows[0].discount_percent;
    return NextResponse.json({ discount_percent: discount }, { status: 200 });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
