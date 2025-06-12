import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'
import sendEmail from '@/lib/sendEmail'

// Use the latest supported version string OR remove it to use Stripe default
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', 
})

export async function POST(req: Request) {
  try {
    const { stripe_session_id } = await req.json()

    if (!stripe_session_id) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(stripe_session_id)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const { rows } = await pool.query(
      'SELECT * FROM checkout_orders WHERE stripe_session_id = $1',
      [stripe_session_id]
    )
    const order = rows[0]

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.email_sent) {
      return NextResponse.json({ success: true, message: 'Email already sent' })
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
    })

    await pool.query(
      'UPDATE checkout_orders SET email_sent = true WHERE id = $1',
      [order.id]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error sending email:', err)
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 })
  }
}
