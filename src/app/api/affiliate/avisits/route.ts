import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        user_id,
        landing_url,
        visited_at,
        affiliate_user
      FROM affiliate_visits
      ORDER BY visited_at DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching visits:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
