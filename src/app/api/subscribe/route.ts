// src/app/api/subscribe/route.ts
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

        // Check if already subscribed
        const checkQuery = 'SELECT _id FROM subscribers WHERE email = $1';
        const checkResult = await pool.query(checkQuery, [normalizedEmail]);

        if (checkResult.rows.length > 0) {
            console.log(`Email '${email}' is already subscribed.`);
            return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
        }

        // Insert new subscriber
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

        // Send welcome email
        const discountCode = "WELCOME10";
        const senderEmail = "onboarding@resend.dev";

        try {
            const { data, error } = await resend.emails.send({
                from: `HobbyistDecals <${senderEmail}>`,
                to: [normalizedEmail],
                subject: 'Welcome to HobbyistDecals! Enjoy 10% Off Your First Order!',
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
                            <h1 style="color:#16689A;">Welcome to HobbyistDecals!</h1>
                            <p>Hi there,</p>
                            <p>Thank you for subscribing to our newsletter! We're excited to have you join the HobbyistDecals community.</p>
                            <p style="text-align:center;">🎉 Use the discount code below to get <strong>10% off</strong> your first order!</p>
                            <p class="discount-code">${discountCode}</p>
                            <p style="text-align:center;"><a href="http://localhost:3000/decal-shop" class="shop-link">Visit Our Shop Now</a></p>
                            <p>Stay tuned for updates on our latest decals, exclusive offers, and exciting news!</p>
                            <p>Happy Decaling,<br>The HobbyistDecals Team</p>
                            <div class="footer">
                                <p>Follow us on:</p>
                                <div class="social-links">
                                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                                </div>
                                <p>© 2025 HobbyistDecals. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent successfully:", data);
            }
        } catch (emailError: unknown) {
            if (emailError instanceof Error) {
                console.error("Caught error during email sending:", emailError.message);
            } else {
                console.error("Unknown error during email sending:", emailError);
            }
        }

        return NextResponse.json({
            message: "You've successfully subscribed and a discount code has been sent to your email!"
        }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error subscribing email or processing request:", error.message);
        } else {
            console.error("Unknown error subscribing email or processing request:", error);
        }

        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            'constraint' in error &&
            (error as { code: string; constraint: string }).code === '23505' &&
            (error as { code: string; constraint: string }).constraint === 'subscribers_email_key'
        ) {
            return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
