import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper to extract the [code] param from the pathname
const getCodeFromRequest = (req: NextRequest): string | null => {
  const pathnameParts = req.nextUrl.pathname.split("/");
  const code = pathnameParts[pathnameParts.length - 1];
  return code || null;
};

export async function GET(req: NextRequest) {
  const code = getCodeFromRequest(req);
  const redirect = req.nextUrl.searchParams.get("redirect") || "https://hobbyist-decals-demo.vercel.app";

  if (!code) {
    return NextResponse.redirect(redirect);
  }

  try {
    // Get the affiliate user by code
    const result = await pool.query(
      "SELECT user_id FROM affiliate_links WHERE code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(redirect);
    }

    const userId = result.rows[0].user_id;

    // Log the visit
    await pool.query(
      `INSERT INTO affiliate_visits (user_id, landing_url, visited_at, affiliate_user)
       VALUES ($1, $2, NOW(), $1)`,
      [userId, redirect]
    );

    return NextResponse.redirect(redirect);
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.redirect(redirect);
  }
}
