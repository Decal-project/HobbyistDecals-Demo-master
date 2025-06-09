// HobbyistDecals-Demo-master\src\app\api\shiprocket\push\route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import axios from 'axios';

export async function POST(req: NextRequest) {
    let client;
    try {
        const body = await req.json();
        console.log('[API] Parsed body for Shiprocket Push:', body);

        const orderId = body.id;
        if (!orderId) {
            console.error('[API] Missing order ID in Shiprocket Push request');
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        client = await pool.connect();

        const orderQuery = await client.query(
            'SELECT * FROM checkout_orders WHERE id = $1 LIMIT 1',
            [orderId]
        );

        if (orderQuery.rows.length === 0) {
            console.error(`[API] Order not found for ID: ${orderId}`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderQuery.rows[0];

        // Check if already pushed to Shiprocket
        if (order.shiprocket_shipment_id) {
            console.log(`[API] Order ${orderId} already pushed to Shiprocket with ID: ${order.shiprocket_shipment_id}. Skipping.`);
            return NextResponse.json({ success: true, message: 'Order already pushed to Shiprocket.' }, { status: 200 });
        }

        const cartId = order.cart_id; // Get cart_id from the order

        // Fetch items from cart_items using cart_id
        const itemsQuery = await client.query(
            'SELECT name, sku, quantity, price FROM cart_items WHERE cart_id = $1',
            [cartId] // Use cartId here instead of orderId
        );

        if (itemsQuery.rows.length === 0) {
            console.warn(`[API] No order items found in cart_items for cart_id: ${cartId}. This order might not be pushed correctly.`);
        }

        const orderItems = itemsQuery.rows;

        const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
        if (!pickupLocation || pickupLocation === "Default Location") {
            console.error('[API] SHIPROCKET_PICKUP_LOCATION is not set or is "Default Location". Please configure it in your .env file to match an exact pickup location name in Shiprocket.');
            return NextResponse.json({ error: 'Shiprocket pickup location not configured correctly' }, { status: 500 });
        }
        console.log('[API] Using Shiprocket Pickup Location:', pickupLocation);


        // --- MODIFIED SECTION: Add missing payload fields ---
        let subTotal = 0;
        orderItems.forEach(item => {
            subTotal += parseFloat(item.price) * item.quantity;
        });

        // Determine if shipping and billing addresses are the same
        const shippingIsBilling = (
            order.shipping_first_name === order.billing_first_name &&
            order.shipping_last_name === order.billing_last_name &&
            order.shipping_email === order.billing_email &&
            order.shipping_phone === order.billing_phone &&
            order.shipping_street_address === order.billing_street_address &&
            order.shipping_city === order.billing_city &&
            order.shipping_state === order.billing_state &&
            order.shipping_country === order.billing_country &&
            order.shipping_postal_code === order.billing_postal_code
        ) ? 1 : 0; // 1 for true, 0 for false

        const payload = {
            order_id: `order-${order.id}`,
            order_date: new Date(order.created_at).toISOString().split('T')[0],
            pickup_location: pickupLocation,
            billing_customer_name: order.billing_first_name,
            billing_last_name: order.billing_last_name,
            billing_email: order.billing_email,
            billing_phone: order.billing_phone,
            billing_address: order.billing_street_address,
            billing_city: order.billing_city,
            billing_state: order.billing_state,
            billing_country: order.billing_country || 'India',
            billing_pincode: order.billing_postal_code,
            billing_company_name: order.billing_company_name || '',
            shipping_customer_name: order.shipping_first_name || order.billing_first_name,
            shipping_last_name: order.shipping_last_name || order.billing_last_name,
            shipping_email: order.shipping_email || order.billing_email,
            shipping_phone: order.shipping_phone || order.billing_phone,
            shipping_address: order.shipping_street_address || order.billing_street_address,
            shipping_city: order.shipping_city || order.billing_city,
            shipping_state: order.shipping_state || order.billing_state,
            shipping_country: order.shipping_country || order.billing_country || 'India',
            shipping_pincode: order.shipping_postal_code || order.billing_postal_code,
            shipping_company_name: order.shipping_company_name || order.billing_company_name || '',
            payment_method: order.payment_method === 'stripe' || order.payment_method === 'paypal' ? 'Prepaid' : 'COD',
            total_amount: parseFloat(order.total_amount),
            sub_total: parseFloat(subTotal.toFixed(2)),
            shipping_is_billing: shippingIsBilling,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5,
            order_items: orderItems.map(item => ({
                name: item.name,
                sku: item.sku && item.sku !== '' ? item.sku : `product-${item.id || 'N/A'}`,
                units: item.quantity,
                selling_price: parseFloat(item.price),
            })),
        };

        console.log('[API] Shiprocket Request Payload:', JSON.stringify(payload, null, 2));

        const tokenRes = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        });

        const token = tokenRes.data.token;
        console.log('[API] Shiprocket Auth Token obtained.');

        const shipRes = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        console.log('[API] Shiprocket success response data:', JSON.stringify(shipRes.data, null, 2)); // Log full response data

        const awb_code = shipRes.data?.data?.shipment_id || shipRes.data?.order_id || 'N/A';
        const shiprocketShipmentId = shipRes.data?.shipment_id;

        if (shiprocketShipmentId) {
            try {
                const updateResult = await client.query(
                    'UPDATE checkout_orders SET shiprocket_shipment_id = $1 WHERE id = $2',
                    [shiprocketShipmentId, orderId]
                );
                console.log(`[API] Order ${orderId} updated with Shiprocket shipment ID: ${shiprocketShipmentId}`, updateResult); // Log update result
            } catch (dbUpdateError) {
                console.error('[API] Error updating checkout_orders:', dbUpdateError); // Log any database update errors
            }
        }

        return NextResponse.json({ success: true, awb_code: awb_code }, { status: 200 });

    } catch (error: any) {
        console.error('[Shiprocket Push Error]', error?.response?.data || error.message);

        if (axios.isAxiosError(error) && error.response) {
            console.error('[Shiprocket Push Error] Status:', error.response.status);
            console.error('[Shiprocket Push Error] Headers:', error.response.headers);
            console.error('[Shiprocket Push Error] Data:', JSON.stringify(error.response.data, null, 2));
            return NextResponse.json(
                {
                    error: 'Failed to push order to Shiprocket',
                    status: error.response.status,
                    details: error.response.data,
                    message: error.message
                },
                { status: error.response.status || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to push order to Shiprocket', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}