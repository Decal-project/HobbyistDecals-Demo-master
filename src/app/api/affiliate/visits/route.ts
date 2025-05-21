import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = 1;

    const result = await pool.query(
      `SELECT landing_url, visited_at
       FROM affiliate_visits
       WHERE user_id = $1
       ORDER BY visited_at DESC`,
      [userId]
    );

    const visits = result.rows.map((row: any) => ({
      landing_url: row.landing_url,
      date: new Date(row.visited_at).toISOString(), // ✅ Fix timestamp format
    }));

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}
