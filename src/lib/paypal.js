// src/lib/paypal.js
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const Environment = process.env.PAYPAL_MODE === 'live'
  ? checkoutNodeJssdk.core.LiveEnvironment
  : checkoutNodeJssdk.core.SandboxEnvironment;

const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(
  new Environment(process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID, process.env.PAYPAL_SECRET_KEY) // <--- Changed this line
);

export default paypalClient;