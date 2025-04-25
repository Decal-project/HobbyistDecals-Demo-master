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

    const result = await pool.query(
      `INSERT INTO affiliate_users 
        (username, firstname, lastname, email, password, payment_email, website, promotion, agreed) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        username,
        firstname,
        lastname,
        email,
        hashedPassword,
        paymentEmail,
        website,
        promotion,
        agree,
      ]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Register Error:', err.message);
    return NextResponse.json({ error: 'Registration failed', message: err.message }, { status: 500 });
  }
}
