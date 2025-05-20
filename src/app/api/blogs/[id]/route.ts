import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return new NextResponse('Invalid blog ID', { status: 400 });
    }

    const result = await pool.query(
      `
      SELECT id, title, content, author_name, cover_image_url, category_name, published_at
      FROM blogs
      WHERE id = $1 AND status = 'published'
      `,
      [blogId]
    );

    if (result.rows.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
