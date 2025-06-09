// src/app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust path if necessary

export async function GET() {
    let client; // Declare client for finally block
    try {
        client = await pool.connect(); // Acquire client from pool

        const { rows: dbRows } = await client.query(`
            SELECT
                o.id AS order_id,
                o.billing_first_name,
                o.billing_last_name,
                o.total_amount,
                o.created_at,
                o.billing_country,
                o.billing_street_address,
                o.billing_city,
                o.billing_state,
                o.billing_postal_code,
                o.billing_phone,
                o.billing_email,
                o.billing_company_name,
                o.cart_id,
                o.payment_method,
                o.stripe_session_id,
                o.paypal_order_id,
                o.status,
                o.ship_to_different_address,
                o.shipping_first_name,
                o.shipping_last_name,
                o.shipping_company_name,
                o.shipping_country,
                o.shipping_street_address,
                o.shipping_city,
                o.shipping_state,
                o.shipping_postal_code,
                o.shipping_phone,
                o.shipping_email,
                o.payment_intent_id,
                o.paypal_capture_id,
                c.id AS item_id,
                c.name AS item_name,
                c.sku,
                c.quantity,
                c.price AS item_price,
                o.shiprocket_shipment_id -- *** ADDED THIS LINE ***
            FROM checkout_orders o
            LEFT JOIN cart_items c ON o.cart_id = c.cart_id
            ORDER BY o.created_at DESC
        `);

        // Group rows by order_id
        const groupedOrders: Record<number, any> = {};

        for (const row of dbRows) {
            const { order_id } = row;

            if (!groupedOrders[order_id]) {
                groupedOrders[order_id] = {
                    id: order_id,
                    customerName: `${row.billing_first_name} ${row.billing_last_name}`,
                    totalAmount: row.total_amount, // Keep as string for now, parse on frontend if needed for display
                    createdAt: row.created_at,
                    paymentMethod: row.payment_method,
                    status: row.status,
                    cartId: row.cart_id,
                    stripeSessionId: row.stripe_session_id,
                    paypalOrderId: row.paypal_order_id,
                    stripePaymentIntentId: row.payment_intent_id,
                    paypalCaptureId: row.paypal_capture_id,
                    billingAddress: {
                        firstName: row.billing_first_name,
                        lastName: row.billing_last_name,
                        email: row.billing_email,
                        phone: row.billing_phone,
                        companyName: row.billing_company_name,
                        country: row.billing_country,
                        streetAddress: row.billing_street_address,
                        city: row.billing_city,
                        state: row.billing_state,
                        postalCode: row.billing_postal_code,
                    },
                    shippingAddress: row.ship_to_different_address ? {
                        firstName: row.shipping_first_name,
                        lastName: row.shipping_last_name,
                        email: row.shipping_email,
                        phone: row.shipping_phone,
                        companyName: row.shipping_company_name,
                        country: row.shipping_country,
                        streetAddress: row.shipping_street_address,
                        city: row.shipping_city,
                        state: row.shipping_state,
                        postalCode: row.shipping_postal_code,
                    } : null,
                    items: [], // Initialize items array
                    shiprocket_shipment_id: row.shiprocket_shipment_id, // *** ADDED THIS LINE ***
                };
            }

            // Only push item if item_id exists (i.e., there was a matching cart item)
            if (row.item_id) {
                groupedOrders[order_id].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    sku: row.sku,
                    quantity: row.quantity,
                    price: row.item_price
                });
            }
        }

        const finalOrders = Object.values(groupedOrders);
        console.log(`Fetched ${finalOrders.length} unique orders for admin/orders.`);
        return NextResponse.json(finalOrders);

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}
