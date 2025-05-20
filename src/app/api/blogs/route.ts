import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
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
       LIMIT 6`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
