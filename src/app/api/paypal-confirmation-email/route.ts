import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import sendEmail from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
    try {
        const { paypal_order_id } = await req.json();

        console.log('Received paypal_order_id:', paypal_order_id); // Keeping the log for the ID received from frontend

        if (!paypal_order_id) {
            return NextResponse.json({ error: 'Missing PayPal order ID' }, { status: 400 });
        }

        const { rows } = await pool.query(
            'SELECT * FROM checkout_orders WHERE paypal_order_id = $1', // Corrected query using paypal_order_id
            [paypal_order_id]
        );
        const order = rows[0];

        if (!order) {
            return NextResponse.json({ error: 'Order not found for PayPal transaction ID' }, { status: 404 }); // Updated error message
        }

        if (order.email_sent) {
            return NextResponse.json({ success: true, message: 'Email already sent for this order' });
        }

        await sendEmail({
            to: order.billing_email,
            subject: 'Your Order Confirmation',
            text: `Thank you, ${order.billing_first_name}, for placing your order!

We’ve received your request and have begun processing it. You’ll receive an update with tracking details as soon as your decals are shipped.

If you have any questions or need further assistance in the meantime, feel free to reach out to us at info@hobbyistdecals.com.

Thank you for choosing Hobbyist Decals — we truly appreciate your support!

Warm regards,
The Hobbyist Decals Team`,
            html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Thank you, ${order.billing_first_name}, for placing your order!</h2>
                        <p>We’ve received your request and have begun processing it. You’ll receive an update with tracking details as soon as your decals are shipped.</p>
                        <p>If you have any questions or need further assistance in the meantime, feel free to reach out to us at <a href="mailto:info@hobbyistdecals.com">info@hobbyistdecals.com</a>.</p>
                        <p>Thank you for choosing <strong>Hobbyist Decals</strong> — we truly appreciate your support!</p>
                        <p>Warm regards,<br/>The Hobbyist Decals Team</p>
                    </div>
                `,
        });

        await pool.query(
            'UPDATE checkout_orders SET email_sent = true WHERE id = $1',
            [order.id]
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error sending PayPal confirmation email:', err);
        return NextResponse.json({ error: 'Failed to send PayPal confirmation' }, { status: 500 });
    }
}