import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool  from "@/lib/db"; // adjust path to your pool instance

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and newPassword are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE admins SET password = $1 WHERE email = $2 RETURNING id",
        [hashedPassword, email]
      );

      if (res.rowCount === 0) {
        return NextResponse.json(
          { error: "Admin with this email does not exist" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
