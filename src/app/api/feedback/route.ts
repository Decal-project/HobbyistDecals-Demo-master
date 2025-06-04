// Example backend API (Next.js route handler)
import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT client_name, rating, review, scale_model_images FROM feedbacks ORDER BY created_at DESC');
    // Convert scale_model_images (Postgres array) to JS array or empty array
    const feedbacks = result.rows.map((row: { scale_model_images: any; }) => ({
      ...row,
      scale_model_images: row.scale_model_images || [],
    }));
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
