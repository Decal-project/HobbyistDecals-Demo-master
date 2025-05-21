import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Fetch affiliate data
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        website,
        destination_url AS "destinationUrl",
        code,
        COALESCE(tracking_link, '') AS "trackingLink",
        COALESCE(COUNT(v.id), 0) AS "visitCount"
      FROM affiliate_links al
      LEFT JOIN affiliate_visits v ON v.user_id = al.user_id
      WHERE al.user_id = $1
      GROUP BY website, destination_url, code, tracking_link
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        website: "",
        destinationUrl: "",
        code: "",
        trackingLink: "",
        visitCount: 0,
      });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Save/update affiliate info
export async function POST(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  const { website, destinationUrl, code } = await req.json();
  if (!website || !code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const trackingLink = `${website}/api/affiliate/track/${encodeURIComponent(code)}?redirect=${encodeURIComponent(destinationUrl)}`;

  try {
    await pool.query(
      `
      INSERT INTO affiliate_links (user_id, website, destination_url, code, tracking_link)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        website = EXCLUDED.website,
        destination_url = EXCLUDED.destination_url,
        code = EXCLUDED.code,
        tracking_link = EXCLUDED.tracking_link
      `,
      [userId, website, destinationUrl, code, trackingLink]
    );

    return NextResponse.json({
      message: "Affiliate link saved.",
      trackingLink,
    });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
