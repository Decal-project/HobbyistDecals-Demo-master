// app/api/gallery/route.ts (or add to your existing route.ts)
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { rows } = await pool.query(
      `SELECT id, image_url, title, description, display_order, is_visible, created_at
       FROM gallery_items
       ORDER BY display_order ASC, created_at DESC` // Order as you prefer
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}