import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// POST: Get shipping rate by country
export async function POST(req: NextRequest) {
  try {
    const { country } = await req.json();
    console.log("Received country:", country);

    // Validate input
    if (!country || typeof country !== "string") {
      console.log("Invalid country input");
      return NextResponse.json({ message: "Invalid country" }, { status: 400 });
    }

    // Query shipping rate for given country (case-insensitive)
    let query = `SELECT "Total_usd" FROM shipping_rates WHERE "Country" ILIKE $1 LIMIT 1`;
    let result = await pool.query(query, [country]);

    // If not found, fallback to "Others"
    if (result.rows.length === 0) {
      console.warn(`Shipping rate not found for ${country}, falling back to 'Others'`);
      query = `SELECT "Total_usd" FROM shipping_rates WHERE "Country" = 'Others' LIMIT 1`;
      result = await pool.query(query);

      if (result.rows.length === 0) {
        return NextResponse.json({ message: "Shipping rate not found" }, { status: 404 });
      }
    }

    const rate = parseFloat(result.rows[0].Total_usd.replace('$', ''));
    console.log(`Shipping rate for ${country || "Others"}: ${rate}`);
    return NextResponse.json({ rate });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Shipping rate error:", error.stack || error.message);
      return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 });
    } else {
      console.error("❌ Unknown error:", error);
      return NextResponse.json({ message: "Server error: Unknown error" }, { status: 500 });
    }
  }
}
