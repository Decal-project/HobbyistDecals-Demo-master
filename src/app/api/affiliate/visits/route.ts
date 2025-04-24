import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const affiliateId = 1; // Replace with real user ID from session/auth

    const { rows } = await pool.query(
      "SELECT landing_url, date FROM affiliate_visits WHERE id = $1 ORDER BY date DESC",
      [affiliateId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch visits" },
      { status: 500 }
    );
  }
}
