import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const idStr = pathParts[pathParts.length - 1];
    const blogId = Number(idStr);

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const client = await pool.connect();

    const result = await client.query(
      `
        SELECT id, title, content, author_name, cover_image_url, category_name, published_at
        FROM blogs
        WHERE id = $1 AND status = 'published'
        LIMIT 1;
      `,
      [blogId]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching blog:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
