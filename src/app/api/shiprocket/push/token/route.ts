import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL!;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD!;

export async function GET() {
  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get Shiprocket token: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (err: unknown) {
    // Safely handle unknown error type
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    }
    console.error('[Shiprocket Token Fetch Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
