import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO auth_users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;

    const values = [name, email, hashedPassword];
    const result = await pool.query(query, values);

    return NextResponse.json(
      { message: "User created successfully", user: result.rows[0] },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong", details: err.message },
      { status: 500 }
    );
  }
}
