import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT 
      COUNT(*)::int AS visits_count, 
      COALESCE(SUM(commission), 0) AS commissions, 
      COALESCE(SUM(earnings), 0) AS earnings 
     FROM affiliate_stats WHERE user_id = $1`,
    [1]  // Replace 1 with the logged-in affiliate user ID
  );

  return NextResponse.json({
    visitsCount: rows[0].visits_count,
    commissions: parseFloat(rows[0].commissions),
    earnings: parseFloat(rows[0].earnings),
  });
}
