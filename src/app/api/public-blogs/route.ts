import { NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL connection pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect(); // Acquire a client from the pool

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
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 10;        
    `;

    const res = await client.query(query); // Execute the query

    client.release(); // Release the client back to the pool

    return NextResponse.json(res.rows); // Return the fetched rows as JSON
  } catch (error) {
    console.error("Error fetching public blogs:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to fetch public blogs" },
      { status: 500 }
    );
  }
}
