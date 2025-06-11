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
                subject: 'Welcome to HobbyistDecals! Enjoy 10% Off Your First Order!', // More engaging subject line
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Welcome to HobbyistDecals!</title>
                        <style>
                            body { font-family: sans-serif; margin: 20px; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
                            h1 { color: #16689A; text-align: center; }
                            p { line-height: 1.6; margin-bottom: 15px; }
                            .discount-code { background-color: #e0f7fa; color: #00897b; font-size: 1.5em; padding: 10px; border-radius: 4px; text-align: center; margin: 20px auto; display: block; width: fit-content; }
                            .shop-link { display: inline-block; background-color: #16689A; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                            .shop-link:hover { background-color: #12557F; }
                            .footer { margin-top: 30px; font-size: 0.8em; color: #777; text-align: center; }
                            .social-links a { color: #16689A; margin: 0 10px; text-decoration: none; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1 style="color:#16689A; text-align:center;">Welcome to HobbyistDecals!</h1>
                            <p>Hi there,</p>
                            <p>Thank you for subscribing to our newsletter! We're excited to have you join the HobbyistDecals community.</p>
                            <p style="text-align:center;">🎉 As a special welcome gift, please use the discount code below to get <strong>10% off</strong> your first order!</p>
                            <p class="discount-code" style="background-color:#e0f7fa; color:#00897b; font-size:1.5em; padding:10px; border-radius:4px; text-align:center; margin:20px auto; display:block; width:fit-content;">${discountCode}</p>
                            <p style="text-align:center;"><a href="http://localhost:3000/decal-shop" class="shop-link" style="display:inline-block; background-color:#16689A; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Visit Our Shop Now</a></p>
                            <p>Stay tuned for updates on our latest decals, exclusive offers, and exciting news!</p>
                            <p>Happy Decaling,<br>The HobbyistDecals Team</p>
                            <div class="footer" style="margin-top:30px; font-size:0.8em; color:#777; text-align:center;">
                                <p>Follow us on:</p>
                                <div class="social-links">
                                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                                </div>
                                <p>© 2025 HobbyistDecals. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
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

        return NextResponse.json({ message: "You've successfully subscribed and a discount code has been sent to your email!" }, { status: 200 }); // More informative success message

    } catch (error: any) {
        console.error("Error subscribing email or processing request:", error);
        if (error.code === '23505' && error.constraint === 'subscribers_email_key') {
            return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
