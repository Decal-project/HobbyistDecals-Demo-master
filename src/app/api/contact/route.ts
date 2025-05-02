// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Use relative path based on your project structure

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const query = `
      INSERT INTO contact_submissions (first_name, last_name, email, phone, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [firstName, lastName, email, phone || null, message];

    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
