import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Fetch affiliate links
export async function GET() {
  try {
    const affiliateId = 1; // Replace with actual user ID from session/auth
    const { rows } = await pool.query(
      "SELECT website, tracking_link FROM affiliate_links WHERE id = $1 LIMIT 1",
      [affiliateId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ website: "", trackingLink: "" });
    }

    return NextResponse.json({
      website: rows[0].website,
      trackingLink: rows[0].tracking_link,
    });
  } catch (error) {
    console.error("Error fetching affiliate links:", error);
    return NextResponse.json(
      { error: "Failed to load links" },
      { status: 500 }
    );
  }
}

// Update or insert affiliate links
export async function POST(request: Request) {
  try {
    const { website, trackingLink } = await request.json();
    const affiliateId = 1; // Replace with actual user ID from session/auth

    // Check if a row with this ID exists
    const { rowCount } = await pool.query(
      "SELECT 1 FROM affiliate_links WHERE id = $1",
      [affiliateId]
    );

    if ((rowCount ?? 0) === 0) {
      // Insert new row if it doesn't exist
      await pool.query(
        "INSERT INTO affiliate_links (id, website, tracking_link) VALUES ($1, $2, $3)",
        [affiliateId, website, trackingLink]
      );
    } else {
      // Otherwise, update the existing row
      await pool.query(
        "UPDATE affiliate_links SET website = $1, tracking_link = $2 WHERE id = $3",
        [website, trackingLink, affiliateId]
      );
    }

    return NextResponse.json({ message: "Links saved successfully!" });
  } catch (error) {
    console.error("Error saving affiliate links:", error);
    return NextResponse.json(
      { error: "Failed to save links" },
      { status: 500 }
    );
  }
}
