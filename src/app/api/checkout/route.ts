import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15' as Stripe.LatestApiVersion,
  });  

  export async function POST(req: Request) {
    try {
      const data = await req.json()
      console.log('Incoming checkout payload:', data)
  
      const {
        billing_first_name,
        billing_last_name,
        billing_company_name,
        billing_country,
        billing_street_address,
        billing_city,
        billing_state,
        billing_postal_code,
        billing_phone,
        billing_email,
  
        ship_to_different_address,
        shipping_first_name,
        shipping_last_name,
        shipping_company_name,
        shipping_country,
        shipping_street_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_phone,
        shipping_email,
  
        order_notes,
        payment_method,
        total_amount,
        cart_id,
      } = data
  
      // Validate required billing fields
      if (!billing_first_name || !billing_last_name || !billing_email) {
        return NextResponse.json(
          { error: 'Missing required billing information.' },
          { status: 400 }
        )
      }
  
      // Insert into checkout_orders (including stripe_session_id)
      const { rows } = await pool.query(
        `INSERT INTO checkout_orders (
          billing_first_name,
          billing_last_name,
          billing_company_name,
          billing_country,
          billing_street_address,
          billing_city,
          billing_state,
          billing_postal_code,
          billing_phone,
          billing_email,
          ship_to_different_address,
          shipping_first_name,
          shipping_last_name,
          shipping_company_name,
          shipping_country,
          shipping_street_address,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          shipping_phone,
          shipping_email,
          order_notes,
          payment_method,
          total_amount,
          cart_id,
          stripe_session_id,
          created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,NOW()
        ) RETURNING id`,
        [
          billing_first_name,
          billing_last_name,
          billing_company_name,
          billing_country,
          billing_street_address,
          billing_city,
          billing_state,
          billing_postal_code,
          billing_phone,
          billing_email,
  
          ship_to_different_address,
          shipping_first_name,
          shipping_last_name,
          shipping_company_name,
          shipping_country,
          shipping_street_address,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          shipping_phone,
          shipping_email,
  
          order_notes,
          payment_method,
          total_amount,
          cart_id,
          '', // Stripe session ID will be updated after session creation
        ]
      )
  
      // If Stripe payment, create Checkout Session
      if (payment_method === 'stripe') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: 'Order Total' },
                unit_amount: Math.round(total_amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel`,
        })
  
        // Update the checkout order with the stripe session_id
        await pool.query(
          `UPDATE checkout_orders SET stripe_session_id = $1 WHERE id = $2`,
          [session.id, rows[0].id]  // Set the session_id for the inserted order
        )
  
        return NextResponse.json({ url: session.url })
      }
  
      // Otherwise (COD), just return success
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error('Checkout route error:', err)
      return NextResponse.json(
        { error: 'Failed to process checkout' },
        { status: 500 }
      )
    }
  }
  
