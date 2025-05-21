import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT id, title, content, author_name, cover_image_url,
             category_name, status, published_at
      FROM blogs
      WHERE status = 'published'
      ORDER BY published_at DESC;
    `;

    const res = await client.query(query);
    client.release();

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching all public blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
