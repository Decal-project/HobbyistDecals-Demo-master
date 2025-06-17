import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import pool from '@/lib/db'; // Assuming '@/lib/db' exports a pg.Pool instance
import { PoolClient } from 'pg'; // Import PoolClient for type hinting

console.log("Stripe Secret Key being used:", process.env.STRIPE_SECRET_KEY ? "Key Found (length: " + process.env.STRIPE_SECRET_KEY.length + ")" : "Key NOT Found!");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    let client: PoolClient | null = null; // Declare client with PoolClient type and initialize to null
    try {
        // Acquire a client from the connection pool
        client = await pool.connect();
        // Start a database transaction
        await client.query('BEGIN');
        console.log('Database transaction started.');

        let affiliate_user_id: number | null = null;
        const cookieStore = cookies();
        const affiliateCodeCookie = cookieStore.get('affiliate_code');

        console.log(`Cookie check: affiliate_code cookie found?`, !!affiliateCodeCookie);
        if (affiliateCodeCookie) {
            const { value: affiliateCode } = affiliateCodeCookie;
            try {
                const { rows } = await client.query<{ user_id: number }>(
                    `SELECT user_id FROM affiliate_links WHERE code = $1`,
                    [affiliateCode]
                );
                if (rows.length > 0) {
                    affiliate_user_id = rows[0].user_id;
                    console.log(`Affiliate user ID found from cookie: ${affiliate_user_id}`);
                } else {
                    console.warn(`Affiliate code '${affiliateCode}' found in cookie but not in affiliate_links table.`);
                }
            } catch (dbError: unknown) {
                if (dbError instanceof Error) {
                    console.error("Error fetching affiliate user ID from affiliate_links:", dbError.message);
                } else {
                    console.error("Error fetching affiliate user ID from affiliate_links:", dbError);
                }
            }
        }
        console.log(`Final affiliate_user_id for insert into checkout_orders:`, affiliate_user_id);

        const data = await req.json();
        console.log('Incoming checkout payload:', data);

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
            cart_id,
            paypalOrderId,
            paypal_payer_id,
        } = data;

        if (!billing_first_name || !billing_last_name || !billing_email || !total_amount || !cart_id) {
            await client.query('ROLLBACK');
            console.warn('Missing required billing, total amount, or cart information. Rolling back transaction.');
            return NextResponse.json(
                { error: 'Missing required billing, total amount, or cart information.' },
                { status: 400 }
            );
        }

        let stripeSessionId: string | null = null;
        const finalPaypalOrderId: string | null = paypalOrderId || null;
        const finalPaypalPayerId: string | null = paypal_payer_id || null;

        let initialOrderStatus = 'pending';
        let initialCommissionStatus = 'pending';

        if (payment_method === 'paypal') {
            initialOrderStatus = 'pending';
            initialCommissionStatus = 'pending';
        } else if (payment_method === 'cod') {
            initialOrderStatus = 'pending';
            initialCommissionStatus = 'on-hold';
        }

        const insertOrderQuery = `
            INSERT INTO checkout_orders (
                billing_first_name, billing_last_name, billing_company_name, billing_country,
                billing_street_address, billing_city, billing_state, billing_postal_code,
                billing_phone, billing_email, ship_to_different_address,
                shipping_first_name, shipping_last_name, shipping_company_name, shipping_country,
                shipping_street_address, shipping_city, shipping_state, shipping_postal_code,
                shipping_phone, shipping_email, order_notes, payment_method, total_amount, cart_id,
                stripe_session_id, paypal_order_id, paypal_payer_id, affiliate_user_id, status, created_at
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
                $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,NOW()
            ) RETURNING id
        `;

        const insertOrderParams = [
            billing_first_name, billing_last_name, billing_company_name, billing_country,
            billing_street_address, billing_city, billing_state, billing_postal_code,
            billing_phone, billing_email, ship_to_different_address,
            shipping_first_name, shipping_last_name, shipping_company_name, shipping_country,
            shipping_street_address, shipping_city, shipping_state, shipping_postal_code,
            shipping_phone, shipping_email, order_notes, payment_method, total_amount, cart_id,
            stripeSessionId,
            finalPaypalOrderId,
            finalPaypalPayerId,
            affiliate_user_id,
            initialOrderStatus
        ];

        console.log('Attempting to insert into checkout_orders with params:', insertOrderParams);

        const { rows: orderRows } = await client.query<{ id: number }>(
            insertOrderQuery,
            insertOrderParams
        );
        const order_id = orderRows[0].id;
        console.log(`New Order ID created: ${order_id} with initial status: ${initialOrderStatus}`);

        const { rows: cartItems } = await client.query<{ sku: string; name: string; quantity: number; price: string }>(
            `SELECT
                sku,
                name,
                quantity,
                price
            FROM public.cart_items
            WHERE cart_id = $1`,
            [cart_id]
        );

        if (cartItems.length === 0) {
            console.warn(`No items found in cart_items for cart_id: ${cart_id}. This order cannot be processed without items.`);
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Cart is empty or invalid. Cannot create order.' }, { status: 400 });
        }

        const shiprocketOrderItems = cartItems.map(item => ({
            name: item.name,
            sku: item.sku,
            units: item.quantity,
            selling_price: parseFloat(item.price),
        }));
        console.log('Formatted Shiprocket order_items:', shiprocketOrderItems);

        if (affiliate_user_id !== null) {
            console.log(`Order ${order_id} has an associated affiliate user ID: ${affiliate_user_id}. Calculating commission.`);

            const commissionRate = 0.10;
            const commissionAmount = parseFloat(total_amount) * commissionRate;
            const currency = 'usd';

            try {
                const insertCommissionQuery = `
                    INSERT INTO affiliate_commissions (
                        affiliate_user_id,
                        order_id,
                        commission_amount,
                        commission_rate,
                        payment_type,
                        status,
                        currency,
                        created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                `;
                const insertCommissionParams = [
                    affiliate_user_id,
                    order_id,
                    commissionAmount,
                    commissionRate,
                    payment_method,
                    initialCommissionStatus,
                    currency
                ];

                console.log('Attempting to insert into affiliate_commissions with params:', insertCommissionParams);
                await client.query(insertCommissionQuery, insertCommissionParams);
                console.log(`Commission of $${commissionAmount.toFixed(2)} recorded for affiliate ${affiliate_user_id} on order ${order_id} with status: ${initialCommissionStatus}.`);

                if (initialCommissionStatus === 'earned' || initialCommissionStatus === 'paid') {
                    await client.query(
                        `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) + $1 WHERE user_id = $2`,
                        [commissionAmount, affiliate_user_id]
                    );
                    console.log(`Affiliate ${affiliate_user_id} total earnings updated in affiliate_users table.`);
                }

            } catch (commissionDbError: unknown) {
                if (commissionDbError instanceof Error) {
                    console.error("Error inserting affiliate commission or updating total earnings:", commissionDbError.message);
                } else {
                    console.error("Error inserting affiliate commission or updating total earnings:", commissionDbError);
                }
                throw commissionDbError;
            }
        }

        if (payment_method === 'cod' || payment_method === 'paypal') {
            console.log(`Attempting to push order ${order_id} to Shiprocket for ${payment_method}.`);
            try {
                const shiprocketPayload = {
                    order_id: `order-${order_id}`,
                    order_date: new Date().toISOString().split('T')[0],
                    pickup_location: "Home",
                    billing_customer_name: billing_first_name,
                    billing_last_name: billing_last_name,
                    billing_email: billing_email,
                    billing_phone: billing_phone,
                    billing_address: billing_street_address,
                    billing_city: billing_city,
                    billing_state: billing_state,
                    billing_country: billing_country,
                    billing_pincode: billing_postal_code,
                    billing_company_name: billing_company_name || "",

                    shipping_customer_name: ship_to_different_address ? shipping_first_name : billing_first_name,
                    shipping_last_name: ship_to_different_address ? shipping_last_name : billing_last_name,
                    shipping_email: ship_to_different_address ? shipping_email : billing_email,
                    shipping_phone: ship_to_different_address ? shipping_phone : billing_phone,
                    shipping_address: ship_to_different_address ? shipping_street_address : billing_street_address,
                    shipping_city: ship_to_different_address ? shipping_city : billing_city,
                    shipping_state: ship_to_different_address ? shipping_state : billing_state,
                    shipping_country: ship_to_different_address ? shipping_country : billing_country,
                    shipping_pincode: ship_to_different_address ? shipping_postal_code : billing_postal_code,
                    shipping_company_name: ship_to_different_address ? shipping_company_name : billing_company_name || "",

                    payment_method: payment_method === 'cod' ? 'COD' : 'Prepaid',
                    total_amount: parseFloat(total_amount),
                    sub_total: parseFloat(total_amount),
                    shipping_is_billing: ship_to_different_address ? 0 : 1,
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: 0.5,
                    order_items: shiprocketOrderItems,
                };

                const shiprocketResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/shiprocket/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shiprocketPayload),
                });

                const shiprocketData = await shiprocketResponse.json();
                if (!shiprocketResponse.ok) {
                    console.error('[Shiprocket API Error Response]:', shiprocketData);
                    throw new Error(`Shiprocket API Error: ${shiprocketData.message || JSON.stringify(shiprocketData.errors)}`);
                }
                console.log('[Shiprocket API Success Response]:', shiprocketData);

            } catch (shiprocketError: unknown) {
                if (shiprocketError instanceof Error) {
                    console.error('[Shiprocket Push Failure]:', shiprocketError.message);
                } else {
                    console.error('[Shiprocket Push Failure]:', shiprocketError);
                }
            }
        }

        if (payment_method === 'stripe') {
            console.log('Payment method is Stripe. Proceeding with Stripe session creation.');
            console.log('Stripe Session Metadata:', { order_id: String(order_id), cart_id: String(cart_id) });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Order Total' },
                        unit_amount: Math.round(parseFloat(total_amount) * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout`,
                metadata: {
                    order_id: String(order_id),
                    cart_id: String(cart_id),
                    affiliate_user_id: affiliate_user_id ? String(affiliate_user_id) : undefined,
                },
            });

            console.log(`Stripe session created: ${session.id}`);
            console.log(`Updating checkout_orders (ID: ${order_id}) with stripe_session_id: ${session.id}`);

            stripeSessionId = session.id;

            await client.query(
                `UPDATE checkout_orders SET stripe_session_id = $1 WHERE id = $2`,
                [stripeSessionId, order_id]
            );
            console.log('checkout_orders updated with stripe_session_id.');

            const insertStripePaymentQuery = `
                INSERT INTO public.stripe_payments (
                    order_id, stripe_session_id, amount, currency, status, created_at
                ) VALUES (
                    $1, $2, $3, $4, 'pending', NOW()
                ) RETURNING id
            `;
            const insertStripePaymentParams = [
                order_id,
                stripeSessionId,
                parseFloat(total_amount),
                'usd'
            ];
            console.log('Attempting to insert into public.stripe_payments with params:', insertStripePaymentParams);
            await client.query(insertStripePaymentQuery, insertStripePaymentParams);
            console.log('public.stripe_payments inserted successfully with status \'pending\'.');

            await client.query('COMMIT');
            console.log('Database transaction committed successfully for Stripe order:', order_id);
            return NextResponse.json({ url: session.url });

        } else if (payment_method === 'paypal') {
            console.log('Payment method is PayPal. Order already created with PayPal IDs.');
            await client.query('COMMIT');
            console.log('Database transaction committed successfully for PayPal order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });

        } else if (payment_method === 'cod') {
            console.log('Payment method is \'cod\'. Order created with initial status \'pending\'.');
            await client.query('COMMIT');
            console.log('Database transaction committed successfully for COD order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });
        }

        await client.query('ROLLBACK');
        console.warn('Unsupported payment method received. Rolling back transaction.');
        return NextResponse.json(
            { error: 'Unsupported payment method.' },
            { status: 400 }
        );

    } catch (err: unknown) {
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error.');
            } catch (rollbackError: unknown) {
                if (rollbackError instanceof Error) {
                    console.error('Error during rollback:', rollbackError.message);
                } else {
                    console.error('Error during rollback:', rollbackError);
                }
            }
        }
        console.error('--- Checkout route FATAL error:', err);

        // More robust error handling for Stripe errors
        if (err instanceof Stripe.StripeError) {
            console.error('Stripe Error Type:', err.type);
            console.error('Stripe Error Code:', err.code); // e.g., 'card_error', 'validation_error'
            console.error('Stripe Error Message:', err.message);
            if (err.raw) {
                console.error('Stripe Raw Error:', err.raw);
                if (typeof err.raw === 'object' && 'message' in err.raw) {
                    console.error('Stripe Raw Message (specific):', (err.raw as any).message); // Sometimes raw.message is more specific
                }
            }
            if (err.statusCode) {
                console.error('Stripe Status Code:', err.statusCode);
            }
            return NextResponse.json(
                { error: 'Failed to process checkout (Stripe Error)', details: err.message },
                { status: err.statusCode || 500 } // Use Stripe's status code if available
            );
        } else if (err instanceof Error) {
            // General JavaScript Error
            console.error('General Error Message:', err.message);
            console.error('Full Error Object in /api/checkout:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            return NextResponse.json(
                { error: 'Failed to process checkout', details: err.message || 'An unknown error occurred' },
                { status: 500 }
            );
        } else {
            // Handle cases where err is neither a StripeError nor a standard Error
            console.error('Full unknown error object in /api/checkout:', JSON.stringify(err));
            return NextResponse.json(
                { error: 'Failed to process checkout', details: 'An unexpected error occurred' },
                { status: 500 }
            );
        }
    } finally {
        if (client) {
            client.release();
            console.log('Database client released.');
        }
    }
}
