// app/api/affiliate/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";  // your NextAuth config
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  // 1. Get session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 2. Look up the affiliate_user by their email (or however you link them)
  const { rows } = await pool.query(
    "SELECT id, affiliate_code FROM affiliate_users WHERE email = $1",
    [session.user.email]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Affiliate user not found" },
      { status: 404 }
    );
  }

  const { id, affiliate_code: code } = rows[0];
  return NextResponse.json({ userId: id, code });
}
