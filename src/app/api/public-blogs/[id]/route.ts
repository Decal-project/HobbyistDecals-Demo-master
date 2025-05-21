import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Correct App Router API signature
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (isNaN(id)) {
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

    const result = await client.query(query, [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
