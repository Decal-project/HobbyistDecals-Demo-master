// app/api/feedbacks/route.ts

import { NextResponse } from 'next/server';
import  pool  from '@/lib/db'; // your pool connection

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const clientName = formData.get('client_name') as string;
    const rating = parseInt(formData.get('rating') as string);
    const review = formData.get('review') as string;
    const file = formData.get('scale_model_images') as File | null;

    // Validate required fields
    if (!clientName || !rating || !review) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl: string | null = null;

    if (file) {
      // Store image as Base64 or use external storage (S3, Cloudinary, etc.)
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      imageUrl = base64Image;
    }

    // Save to DB (storing image as array)
    await pool.query(
      `
      INSERT INTO feedbacks (client_name, rating, review, scale_model_images)
      VALUES ($1, $2, $3, $4)
      `,
      [clientName, rating, review, imageUrl ? [imageUrl] : []]
    );

    return NextResponse.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
