// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Import your PostgreSQL connection pool
import { Resend } from 'resend'; // Import Resend

const resend = new Resend(process.env.RESEND_API_KEY); // Initialize Resend with your API key

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`Received subscription request for email: ${email}`);

    const normalizedEmail = email.toLowerCase();

    // 1. Check if the email already exists in the 'subscribers' table
    const checkQuery = 'SELECT _id FROM subscribers WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [normalizedEmail]);

    if (checkResult.rows.length > 0) {
      console.log(`Email '${email}' is already subscribed.`);
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    // 2. Insert the new subscriber into the 'subscribers' table
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

    // --- NEW: Send Welcome Email with Discount Code ---
    const discountCode = "WELCOME10"; // Your actual discount code
    const senderEmail = "onboarding@resend.dev"; // Use your verified Resend domain email (e.g., from your domain hobbyistdecals.com)
                                                 // For testing, Resend provides 'onboarding@resend.dev' or similar.

    try {
      const { data, error } = await resend.emails.send({
        from: `HobbyistDecals <${senderEmail}>`, // Display name <sender_email>
        to: [normalizedEmail],
        subject: 'Welcome to HobbyistDecals! Here\'s Your 10% Discount!',
        html: `
          <h1>Welcome to HobbyistDecals!</h1>
          <p>Thank you for subscribing! As a token of our appreciation, here's your exclusive 10% discount code for your next order:</p>
          <p><strong>Discount Code: ${discountCode}</strong></p>
          <p>Visit our shop: <a href="http://localhost:3000/decal-shop">HobbyistDecals Shop</a></p>
          <p>We'll keep you updated on new products and special offers.</p>
          <p>Happy Decaling!</p>
          <p>The HobbyistDecals Team</p>
        `,
        // You can also use `text` for plain text email:
        // text: `Welcome to HobbyistDecals! Here's your 10% discount code: ${discountCode}. Happy Decaling!`
      });

      if (error) {
        console.error("Error sending email:", error);
        // Decide if you want to fail the subscription or just log the email error
        // For now, we'll log it but still return success for subscription.
      } else {
        console.log("Email sent successfully:", data);
      }
    } catch (emailError) {
      console.error("Caught error during email sending:", emailError);
    }
    // --- End of NEW: Send Welcome Email with Discount Code ---

    return NextResponse.json({ message: "Subscription successful!" }, { status: 200 });

  } catch (error: any) {
    console.error("Error subscribing email or processing request:", error);
    if (error.code === '23505' && error.constraint === 'subscribers_email_key') {
        return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}