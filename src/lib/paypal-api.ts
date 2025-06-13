// src/lib/paypal-api.ts
import { Buffer } from 'buffer';

// FIX: Use the correct environment variable names as defined in your .env file
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID; // Match .env name
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET_KEY; // Match .env name

// Use sandbox URL for development, live URL for production
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

let cachedAccessToken: { token: string; expiry: number } | null = null;

export async function getPaypalAccessToken(): Promise<string> {
    // Check if token is cached and not expired
    if (cachedAccessToken && Date.now() < cachedAccessToken.expiry) {
        console.log('Using cached PayPal access token.');
        return cachedAccessToken.token;
    }

    // Now this check will correctly use the values from your .env
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('PayPal Client ID and Secret must be set in environment variables (NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SECRET_KEY).'); // Updated error message for clarity
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    console.log('Fetching new PayPal access token...');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to get PayPal access token:', errorData);
        throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    cachedAccessToken = {
        token: data.access_token,
        expiry: Date.now() + (data.expires_in - 60) * 1000,
    };
    console.log('Successfully fetched and cached new PayPal access token.');
    return data.access_token;
}

// Function to get capture details
export async function getPaypalCaptureDetails(captureId: string): Promise<any> {
    const accessToken = await getPaypalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${captureId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to get PayPal capture details for ${captureId}:`, errorData);
        throw new Error(`Failed to get PayPal capture details: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
}