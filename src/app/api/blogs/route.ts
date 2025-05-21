import { NextResponse } from "next/server";
import { Pool } from "pg";

// Configure your PostgreSQL connection (use environment variables ideally)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();

    // Replace column names if different in your blogs table
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
      ORDER BY published_at DESC
      LIMIT 50;
    `;

    const res = await client.query(query);

    client.release();

    // Return data as JSON
    return NextResponse.json({ blogs: res.rows });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
