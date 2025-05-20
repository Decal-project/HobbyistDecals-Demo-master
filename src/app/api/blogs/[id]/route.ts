import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Make sure this exports your configured PG pool

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT id, title, content, author_name, cover_image_url, category_name, published_at
       FROM blogs
       WHERE id = $1 AND status = 'published'`,
      [id]
    );

    if (result.rows.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog by id:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
