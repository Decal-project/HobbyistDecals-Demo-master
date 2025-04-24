import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const {
      username,
      firstname,
      lastname,
      email,
      password,
      paymentEmail,
      website,
      promotion,
      agree,
    } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO affiliate_users 
        (username, firstname, lastname, email, password, payment_email, website, promotion, agreed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;

    const values = [
      username,
      firstname,
      lastname,
      email,
      hashedPassword,
      paymentEmail,
      website,
      promotion,
      agree,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error registering affiliate:', err);
    return NextResponse.json(
      { error: 'Failed to register affiliate', details: err.message },
      { status: 500 }
    );
  }
}
