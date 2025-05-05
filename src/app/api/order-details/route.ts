// File: src/app/api/order-details/route.ts

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      'SELECT billing_first_name, billing_last_name, total_amount FROM checkout_orders WHERE stripe_session_id = $1',
      [session_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = result.rows[0]
    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
