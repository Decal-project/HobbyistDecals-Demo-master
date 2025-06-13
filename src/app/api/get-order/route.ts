// app/api/get-order/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const session_id = searchParams.get('session_id')

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const { rows } = await pool.query(
    'SELECT billing_first_name, billing_last_name, total_amount FROM checkout_orders WHERE stripe_session_id = $1',
    [session_id]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
