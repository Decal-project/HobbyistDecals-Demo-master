// app/api/user/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Retrieve userId from query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Query to check if user exists in the affiliate_users table
    const { rows } = await pool.query(
      'SELECT id FROM affiliate_users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ userId: rows[0].id });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
