// app/api/affiliate/dashboard/route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // 🔐 Hardcoded user ID — replace this later with session/token logic
    const userId = 1;

    // 1. Count visits
    const visitsRes = await pool.query(
      `SELECT COUNT(*)::int AS visits_count FROM affiliate_visits WHERE user_id = $1`,
      [userId]
    );
    const visitsCount = visitsRes.rows[0].visits_count;

    // 2. Stub commissions & earnings (update later)
    const commissions = 0;
    const earnings = 0;

    return NextResponse.json(
      { visitsCount, commissions, earnings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
