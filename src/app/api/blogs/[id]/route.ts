import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const result = await pool.query(
      `SELECT id, title, content, author_name, cover_image_url, category_name, published_at
       FROM blogs
       WHERE id = $1 AND status = 'published'`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
