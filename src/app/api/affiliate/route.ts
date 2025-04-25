import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM affiliate_users ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: 'Failed to fetch users', message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active } = await req.json();

    await pool.query(
      'UPDATE affiliate_users SET is_active = $1 WHERE id = $2',
      [is_active, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: 'Failed to update user', message: err.message }, { status: 500 });
  }
}
