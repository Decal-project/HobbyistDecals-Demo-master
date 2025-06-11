import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust path if necessary
import type { PoolClient } from 'pg';

// Define a type for the DB row result
type OrderItemRow = {
    order_id: number;
    billing_first_name: string;
    billing_last_name: string;
    total_amount: string;
    created_at: string;
    billing_country: string;
    billing_street_address: string;
    billing_city: string;
    billing_state: string;
    billing_postal_code: string;
    billing_phone: string;
    billing_email: string;
    billing_company_name: string;
    cart_id: string;
    payment_method: string;
    stripe_session_id: string | null;
    paypal_order_id: string | null;
    status: string;
    ship_to_different_address: boolean;
    shipping_first_name: string | null;
    shipping_last_name: string | null;
    shipping_company_name: string | null;
    shipping_country: string | null;
    shipping_street_address: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_postal_code: string | null;
    shipping_phone: string | null;
    shipping_email: string | null;
    payment_intent_id: string | null;
    paypal_capture_id: string | null;
    item_id: string | null;
    item_name: string | null;
    sku: string | null;
    quantity: number | null;
    item_price: string | null;
    shiprocket_shipment_id: string | null;
    refund_amount: string | null;
};

type GroupedOrder = {
    id: number;
    customerName: string;
    totalAmount: string;
    createdAt: string;
    paymentMethod: string;
    status: string;
    cartId: string;
    stripeSessionId: string | null;
    paypalOrderId: string | null;
    stripePaymentIntentId: string | null;
    paypalCaptureId: string | null;
    billingAddress: Record<string, string>;
    shippingAddress: Record<string, string> | null;
    items: {
        id: string;
        name: string;
        sku: string;
        quantity: number;
        price: string;
    }[];
    shiprocket_shipment_id: string | null;
    refund_amount: string | null;
};

export async function GET() {
    let client: PoolClient | null = null;
    try {
        client = await pool.connect();

        const { rows: dbRows }: { rows: OrderItemRow[] } = await client.query(`
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
                o.shiprocket_shipment_id,
                o.refund_amount
            FROM checkout_orders o
            LEFT JOIN cart_items c ON o.cart_id = c.cart_id
            ORDER BY o.created_at DESC
        `);

        const groupedOrders: Record<number, GroupedOrder> = {};

        for (const row of dbRows) {
            const { order_id } = row;

            if (!groupedOrders[order_id]) {
                groupedOrders[order_id] = {
                    id: order_id,
                    customerName: `${row.billing_first_name} ${row.billing_last_name}`,
                    totalAmount: row.total_amount,
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
                        firstName: row.shipping_first_name ?? '',
                        lastName: row.shipping_last_name ?? '',
                        email: row.shipping_email ?? '',
                        phone: row.shipping_phone ?? '',
                        companyName: row.shipping_company_name ?? '',
                        country: row.shipping_country ?? '',
                        streetAddress: row.shipping_street_address ?? '',
                        city: row.shipping_city ?? '',
                        state: row.shipping_state ?? '',
                        postalCode: row.shipping_postal_code ?? '',
                    } : null,
                    items: [],
                    shiprocket_shipment_id: row.shiprocket_shipment_id,
                    refund_amount: row.refund_amount,
                };
            }

            if (row.item_id) {
                groupedOrders[order_id].items.push({
                    id: row.item_id,
                    name: row.item_name ?? '',
                    sku: row.sku ?? '',
                    quantity: row.quantity ?? 0,
                    price: row.item_price ?? '0',
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
            client.release();
        }
    }
}
