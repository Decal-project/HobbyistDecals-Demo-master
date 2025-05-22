import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// This is the correct way to type the GET handler for a dynamic route
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const blogId = parseInt(id, 10);

  if (isNaN(blogId)) {
    return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
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
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
