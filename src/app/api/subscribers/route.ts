// src/app/api/subscribers/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// POST: Add new subscriber
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log("Received email:", email); // Log the email received from client

    // Validate email
    if (!email || !email.includes("@")) {
      console.log("Invalid email format");
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    // SQL query
    const query = `
      INSERT INTO subscribers (email, subscription_date, status, source, created_at, updated_at)
      VALUES ($1, NOW(), 'subscribed', 'footer_form', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        updated_at = NOW(),
        status = 'subscribed'
    `;
    console.log("Executing query with email:", email);
    
    // Run the query
    await pool.query(query, [email]);

    // Success response
    return NextResponse.json({ message: "Thank you for subscribing!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Subscription error:", error.stack || error.message);
      return NextResponse.json({ message: `Server error: ${error.message || 'try again.'}` }, { status: 500 });
    } else {
      console.error("❌ Unknown error:", error);
      return NextResponse.json({ message: "Server error: Unknown error" }, { status: 500 });
    }
  }
}
