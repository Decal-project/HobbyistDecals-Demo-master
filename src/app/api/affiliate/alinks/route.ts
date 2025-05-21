import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        user_id,
        website,
        destination_url,
        code,
        tracking_link
      FROM affiliate_links
      ORDER BY user_id ASC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET all affiliate links error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
