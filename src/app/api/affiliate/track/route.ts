// File: /app/api/affiliate/track/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { affiliateId, landingUrl } = await request.json();

    if (!affiliateId || !landingUrl) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO affiliate_visits (affiliate_id, landing_url, visit_time)
       VALUES ($1, $2, NOW())`,
      [affiliateId, landingUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving visit:", error);
    return NextResponse.json({ error: "Failed to save visit" }, { status: 500 });
  }
}
