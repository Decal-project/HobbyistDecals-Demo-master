import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db"; // adjust based on your actual pool path

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    const admin = result.rows[0];

    if (!admin) {
      console.log("❌ Admin not found");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("✅ Admin login successful");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
