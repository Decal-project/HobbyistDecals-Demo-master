// src/app/api/create-paypal-order/route.ts
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { cartId, totalAmount, currency } = body; // Destructure after parsing

    // FIX: Ensure totalAmount is a number
    totalAmount = parseFloat(totalAmount);

    // Log the incoming totalAmount for debugging
    console.log('Incoming totalAmount for PayPal order (after parseFloat):', totalAmount);
    console.log('Type of totalAmount:', typeof totalAmount); // Add this for clarity

    // Basic validation for totalAmount
    // Now this check will correctly evaluate if totalAmount is a valid number > 0
    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.error('Invalid totalAmount for PayPal order (validation failed):', totalAmount);
      return NextResponse.json(
        { error: 'Invalid total amount provided. Must be a positive number.' },
        { status: 400 } // Bad Request
      );
    }

    // PayPal API requires amount value as a string with 2 decimal places
    const formattedTotalAmount = totalAmount.toFixed(2);
    console.log('Formatted totalAmount for PayPal API:', formattedTotalAmount);


    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET_KEY;

    // Basic validation for environment variables
    if (!paypalClientId) {
      return NextResponse.json({ error: 'PayPal Client ID is not configured.' }, { status: 500 });
    }
    if (!paypalSecret) {
      return NextResponse.json({ error: 'PayPal Secret Key is not configured.' }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');

    const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency || 'USD',
              value: formattedTotalAmount,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal order creation failed:', errorData);
      return NextResponse.json(
        { error: 'PayPal order creation failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('PayPal Order Created:', data);

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create PayPal order.' }, { status: 500 });
  }
}