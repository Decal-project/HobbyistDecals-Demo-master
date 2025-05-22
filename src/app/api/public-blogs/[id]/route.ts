import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const blogId = Number(id);

  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    const query = `
      SELECT
        id,
        title,
        content,
        author_name,
        cover_image_url,
        category_name,
        status,
        published_at
      FROM blogs
      WHERE id = $1 AND status = 'published'
      LIMIT 1;
    `;

    const result = await client.query(query, [blogId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
