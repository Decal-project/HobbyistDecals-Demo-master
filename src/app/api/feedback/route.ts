// Example backend API (Next.js route handler)
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Define the expected structure of each feedback row
interface FeedbackRow {
  client_name: string;
  rating: number;
  review: string;
  scale_model_images: string[] | null;
}

export async function GET() {
  try {
    const result = await pool.query<FeedbackRow>(
      'SELECT client_name, rating, review, scale_model_images FROM feedbacks ORDER BY created_at DESC'
    );

    // Normalize the `scale_model_images` to always be an array
    const feedbacks = result.rows.map((row) => ({
      ...row,
      scale_model_images: row.scale_model_images ?? [],
    }));

    return NextResponse.json(feedbacks);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
