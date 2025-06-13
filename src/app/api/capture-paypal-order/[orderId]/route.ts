import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, context: { params: { orderId: string } }) {
  // FIX 1: Await context.params
  const { orderId } = await context.params;

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  try {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET_KEY;

    if (!paypalClientId) {
      return NextResponse.json({ error: 'PayPal Client ID is not configured.' }, { status: 500 });
    }
    if (!paypalSecret) {
      return NextResponse.json({ error: 'PayPal Secret Key is not configured.' }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');

    const res = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('PayPal capture error details:', data);
      return NextResponse.json({ error: 'PayPal capture failed', details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Capture error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}