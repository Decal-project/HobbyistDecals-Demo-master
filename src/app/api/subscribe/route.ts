import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`Received subscription request for email: ${email}`);

    const normalizedEmail = email.toLowerCase();

    // 1. Check if email already exists
    const checkQuery = 'SELECT _id FROM subscribers WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [normalizedEmail]);

    if (checkResult.rows.length > 0) {
      console.log(`Email '${email}' is already subscribed.`);
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    // 2. Insert into database
    const insertQuery = `
      INSERT INTO subscribers (
        _id, email, first_name, last_name, phone, subscription_date,
        status, preferences, source, location, last_engagement_date,
        unsubscribe_reason, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), $1, NULL, NULL, NULL, NOW(),
        'subscribed', NULL, 'popup_form', NULL, NULL,
        NULL, CURRENT_DATE, CURRENT_DATE
      )
      RETURNING _id;
    `;
    const insertResult = await pool.query(insertQuery, [normalizedEmail]);
    const newSubscriberId = insertResult.rows[0]._id;

    console.log(`Email '${email}' successfully subscribed with ID: ${newSubscriberId}`);

    // --- Send Welcome Email ---
    const discountCode = "WELCOME10";
    const senderEmail = "onboarding@resend.dev";

    try {
      const { data, error } = await resend.emails.send({
        from: `HobbyistDecals <${senderEmail}>`,
        to: [normalizedEmail],
        subject: "Welcome to HobbyistDecals! Here's Your 10% Discount!",
        html: `
          <h1>Welcome to HobbyistDecals!</h1>
          <p>Thank you for subscribing! Here's your 10% discount code:</p>
          <p><strong>Discount Code: ${discountCode}</strong></p>
          <p>Visit: <a href="http://localhost:3000/decal-shop">HobbyistDecals Shop</a></p>
          <p>The HobbyistDecals Team</p>
        `,
      });

      if (error) {
        console.error("Error sending email via Resend:", error);
        // Don't fail the subscription if email sending fails
      } else {
        console.log("Email sent successfully:", data);
      }
    } catch (emailError) {
      console.error("Unexpected error during email sending:", emailError);
    }

    return NextResponse.json({ message: "Subscription successful!" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error in subscription handler:", error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
