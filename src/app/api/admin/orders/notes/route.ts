// app/api/orders/notes/route.ts
import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';

export async function GET() {
  const result = await pool.query(`
    SELECT id, billing_first_name, billing_email, billing_phone, order_notes, note_done
    FROM checkout_orders
    WHERE order_notes IS NOT NULL AND order_notes <> ''
    ORDER BY created_at DESC
  `);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const { id, note_done } = await request.json();
  await pool.query(
    'UPDATE checkout_orders SET note_done = $1 WHERE id = $2',
    [note_done, id]
  );
  return NextResponse.json({ success: true });
}
