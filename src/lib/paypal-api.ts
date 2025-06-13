import { Buffer } from 'buffer';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET_KEY;

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

let cachedAccessToken: { token: string; expiry: number } | null = null;

interface PayPalAccessTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  app_id: string;
  nonce: string;
}

interface PayPalCaptureDetails {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  final_capture: boolean;
  seller_protection: {
    status: string;
    dispute_categories: string[];
  };
  create_time: string;
  update_time: string;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
}

export async function getPaypalAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiry) {
    console.log('Using cached PayPal access token.');
    return cachedAccessToken.token;
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal Client ID and Secret must be set in environment variables (NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SECRET_KEY).');
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

  const data: PayPalAccessTokenResponse = await response.json();
  cachedAccessToken = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in - 60) * 1000,
  };
  console.log('Successfully fetched and cached new PayPal access token.');
  return data.access_token;
}

export async function getPaypalCaptureDetails(captureId: string): Promise<PayPalCaptureDetails> {
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

  const data: PayPalCaptureDetails = await response.json();
  return data;
}
