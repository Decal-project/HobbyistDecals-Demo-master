// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();

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
    } = data;

    await pool.query(
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
        total_amount
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24
      )`,
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
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to submit checkout" }, { status: 500 });
  }
}
