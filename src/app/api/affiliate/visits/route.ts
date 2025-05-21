import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type VisitRow = {
  landing_url: string;
  visited_at: string | Date;
};

export async function GET() {
  try {
    const userId = 1;

    const result = await pool.query(
      `SELECT landing_url, visited_at
       FROM affiliate_visits
       WHERE user_id = $1
       ORDER BY visited_at DESC`,
      [userId]
    );

    const visits = result.rows.map((row: VisitRow) => ({
      landing_url: row.landing_url,
      date: new Date(row.visited_at).toISOString(),
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
