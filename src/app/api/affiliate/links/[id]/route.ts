import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        destination_url AS "destinationUrl",
        code,
        COALESCE(tracking_link, '') AS "trackingLink",
        (
          SELECT COUNT(*) FROM affiliate_visits WHERE user_id = $1
        ) AS "visitCount"
      FROM affiliate_links
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({
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

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id;
  const { destinationUrl, code } = await request.json();

  if (!destinationUrl || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const baseWebsite = "https://hobbyist-decals.vercel.app";
  const trackingLink = `${baseWebsite}/api/affiliate/track/${encodeURIComponent(code)}?redirect=${encodeURIComponent(destinationUrl)}`;

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
      [userId, baseWebsite, destinationUrl, code, trackingLink]
    );

    return NextResponse.json({ trackingLink });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
