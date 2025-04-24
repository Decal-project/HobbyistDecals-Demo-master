import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
const bcrypt = require('bcrypt');
export async function POST(req: NextRequest) {
  try {
    const { usernameOrEmail, password } = await req.json();

    const result = await pool.query(
      `SELECT * FROM affiliate_users WHERE username = $1 OR email = $1`,
      [usernameOrEmail]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account not yet activated by admin' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 });
  }
}
