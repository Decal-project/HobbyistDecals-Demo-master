import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.pathname.split('/').pop(); // Extract orderId from the dynamic route

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  try {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET_KEY;

    if (!paypalClientId || !paypalSecret) {
      return NextResponse.json(
        { error: 'PayPal credentials are not configured.' },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');

    const PAYPAL_API_BASE =
      process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('PayPal capture error:', data);
      return NextResponse.json({ error: 'PayPal capture failed', details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Server error during PayPal capture:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
