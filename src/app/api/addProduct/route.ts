import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Add product handler
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, brand, price, category, description, imageUrl, stock } = data;

    const result = await pool.query(
      `INSERT INTO products (name, brand, price, category, description, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, brand, price, category, description, imageUrl, stock]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}
