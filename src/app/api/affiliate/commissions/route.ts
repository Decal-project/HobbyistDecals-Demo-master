import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Set your commission rate per visit
const COMMISSION_PER_VISIT = 2;

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        v.user_id,
        COUNT(*) AS visit_count,
        COUNT(*) * $1 AS total_commission
      FROM affiliate_visits v
      GROUP BY v.user_id
      ORDER BY total_commission DESC
    `, [COMMISSION_PER_VISIT]);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Commission API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
