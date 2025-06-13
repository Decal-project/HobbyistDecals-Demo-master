import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import pool from '@/lib/db'; // Assuming '@/lib/db' exports a pg.Pool instance

console.log("Stripe Secret Key being used:", process.env.STRIPE_SECRET_KEY ? "Key Found (length: " + process.env.STRIPE_SECRET_KEY.length + ")" : "Key NOT Found!");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    let client: Awaited<ReturnType<typeof pool.connect>> | undefined; // Declare client with a more specific type and make it optional
    try {
        // Acquire a client from the connection pool
        client = await pool.connect();
        // Start a database transaction
        await client.query('BEGIN');
        console.log('Database transaction started.');

        let affiliate_user_id: number | null = null;
        // Adjusted: Call cookies() once and store its result
        const cookieStore = cookies();
        const affiliateCodeCookie = cookieStore.get('affiliate_code');

        console.log(`Cookie check: affiliate_code cookie found?`, !!affiliateCodeCookie);
        if (affiliateCodeCookie) {
            const { value: affiliateCode } = affiliateCodeCookie;
            try {
                const { rows } = await client.query<{ user_id: number }>( // Specify row type for clarity
                    `SELECT user_id FROM affiliate_links WHERE code = $1`,
                    [affiliateCode]
                );
                if (rows.length > 0) {
                    affiliate_user_id = rows[0].user_id;
                    console.log(`Affiliate user ID found from cookie: ${affiliate_user_id}`);
                } else {
                    console.warn(`Affiliate code '${affiliateCode}' found in cookie but not in affiliate_links table.`);
                }
            } catch (dbError) {
                console.error("Error fetching affiliate user ID from affiliate_links:", dbError);
                // Continue execution, as this is not a critical error for order creation
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
            cart_id, // This is crucial for fetching cart items
            paypal_order_id,
            paypal_payer_id,
        } = data;

        if (!billing_first_name || !billing_last_name || !billing_email || !total_amount || !cart_id) {
            // Added total_amount and cart_id as critical missing info
            if (client) { // Check if client exists before rolling back
                await client.query('ROLLBACK'); // Rollback if validation fails
            }
            console.warn('Missing required billing, total amount, or cart information. Rolling back transaction.');
            return NextResponse.json(
                { error: 'Missing required billing, total amount, or cart information.' },
                { status: 400 }
            );
        }

        const stripeSessionId: string | null = null; // Changed to const as it's not reassigned here
        let finalPaypalOrderId: string | null = null;
        let finalPaypalPayerId: string | null = null;

        let initialOrderStatus = 'pending';
        let initialCommissionStatus = 'pending'; // General initial status for commissions

        if (payment_method === 'paypal') {
            finalPaypalOrderId = paypal_order_id || null;
            finalPaypalPayerId = paypal_payer_id || null;
            initialOrderStatus = 'pending'; // Awaiting webhook confirmation for capture
            initialCommissionStatus = 'pending'; // Will be 'earned' on capture.completed webhook
        } else if (payment_method === 'cod') {
            initialOrderStatus = 'pending'; // Or 'on-hold' if you have that status
            initialCommissionStatus = 'on-hold'; // Commission also on-hold for COD until confirmed
        }
        // For 'stripe', initialOrderStatus defaults to 'pending' from above

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
            stripeSessionId, // Will be null for PayPal/COD, updated later for Stripe
            finalPaypalOrderId, // Will be null for Stripe/COD
            finalPaypalPayerId, // Will be null for Stripe/COD
            affiliate_user_id,
            initialOrderStatus
        ];

        console.log('Attempting to insert into checkout_orders with params:', insertOrderParams);

        const { rows: orderRows } = await client.query<{ id: number }>( // Specify row type for clarity
            insertOrderQuery,
            insertOrderParams
        );
        const order_id = orderRows[0].id;
        console.log(`New Order ID created: ${order_id} with initial status: ${initialOrderStatus}`);

        // --- FETCH CART ITEMS FOR SHIPROCKET & STRIPE LINE ITEMS ---
        // Using the provided public.cart_items schema
        const { rows: cartItems } = await client.query<CartItem>( // Specify CartItem type
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
            if (client) { // Check if client exists before rolling back
                await client.query('ROLLBACK'); // Rollback if cart is empty
            }
            return NextResponse.json({ error: 'Cart is empty or invalid. Cannot create order.' }, { status: 400 });
        }

        const shiprocketOrderItems = cartItems.map(item => ({
            name: item.name,
            sku: item.sku,
            units: item.quantity,
            selling_price: parseFloat(item.price), // Ensure price is a number
        }));
        console.log('Formatted Shiprocket order_items:', shiprocketOrderItems);
        // --- END FETCH CART ITEMS ---


        // --- COMMISSION CALCULATION AND INSERTION LOGIC ---
        if (affiliate_user_id !== null) {
            console.log(`Order ${order_id} has an associated affiliate user ID: ${affiliate_user_id}. Calculating commission.`);

            const commissionRate = 0.10;
            const commissionAmount = total_amount * commissionRate;
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
                await client.query(insertCommissionQuery, insertCommissionParams); // Use client
                console.log(`Commission of $${commissionAmount.toFixed(2)} recorded for affiliate ${affiliate_user_id} on order ${order_id} with status: ${initialCommissionStatus}.`);

                // Update total_earnings only if the commission status allows (e.g., if 'earned' or 'paid' immediately)
                // For 'pending' or 'on-hold', you might update this later via webhook/manual process
                if (initialCommissionStatus === 'earned' || initialCommissionStatus === 'paid') {
                    await client.query( // Use client
                        `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) + $1 WHERE user_id = $2`,
                        [commissionAmount, affiliate_user_id]
                    );
                    console.log(`Affiliate ${affiliate_user_id} total earnings updated in affiliate_users table.`);
                }

            } catch (commissionDbError) {
                console.error("Error inserting affiliate commission or updating total earnings:", commissionDbError);
                // This error might warrant a rollback or might be acceptable to log and proceed
                throw commissionDbError; // Re-throw to trigger the main catch and rollback
            }
        }
        // --- END COMMISSION LOGIC ---

        // --- SHIPROCKET PUSH (for COD and initial PayPal - consider moving PayPal/Stripe to webhooks) ---
        // It's generally better to push to Shiprocket *after* payment confirmation for prepaid methods
        // (i.e., in your Stripe/PayPal webhook handlers). For COD, it's fine here.
        if (payment_method === 'cod' || payment_method === 'paypal') {
            console.log(`Attempting to push order ${order_id} to Shiprocket for ${payment_method}.`);
            try {
                const shiprocketPayload = {
                    order_id: `order-${order_id}`,
                    order_date: new Date().toISOString().split('T')[0], //YYYY-MM-DD format
                    pickup_location: "Home", // IMPORTANT: This should be your actual Shiprocket pickup location name
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

                    payment_method: payment_method === 'cod' ? 'COD' : 'Prepaid', // Shiprocket uses 'COD' or 'Prepaid'
                    total_amount: total_amount,
                    sub_total: total_amount, // Adjust if your subtotal is different from total_amount (e.g., if total includes shipping)
                    shipping_is_billing: ship_to_different_address ? 0 : 1, // 0 for different, 1 for same
                    length: 10, // Placeholder values, adjust based on your products/packaging
                    breadth: 10,
                    height: 10,
                    weight: 0.5, // Placeholder value, consider calculating actual weight from cart items
                    order_items: shiprocketOrderItems, // THIS IS NOW POPULATED
                };

                // Assuming you have a separate API route /api/shiprocket/push that handles the actual Shiprocket API call
                const shiprocketResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/shiprocket/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shiprocketPayload),
                });

                const shiprocketData: { message?: string; errors?: any } = await shiprocketResponse.json(); // Specify type for shiprocketData
                if (!shiprocketResponse.ok) {
                    console.error('[Shiprocket API Error Response]:', shiprocketData);
                    // Decide if you want to rollback the order if Shiprocket push fails here.
                    // For now, logging and continuing. If critical, uncomment the throw below.
                    throw new Error(`Shiprocket API Error: ${shiprocketData.message || JSON.stringify(shiprocketData.errors)}`);
                }
                console.log('[Shiprocket API Success Response]:', shiprocketData);

            } catch (shiprocketError: Error) { // Specify Error type
                console.error('[Shiprocket Push Failure]:', shiprocketError.message || shiprocketError);
                // IMPORTANT: If a failed Shiprocket push means the order is invalid, uncomment the following:
                // await client.query('ROLLBACK');
                // return NextResponse.json({ error: 'Failed to integrate with shipping partner. Please try again.' }, { status: 500 });
            }
        }
        // --- END SHIPROCKET PUSH ---

        if (payment_method === 'stripe') {
            console.log('Payment method is Stripe. Proceeding with Stripe session creation.');
            console.log('Stripe Session Metadata:', { order_id: String(order_id), cart_id: String(cart_id) });

            // Using cartItems fetched earlier to create Stripe line items
            // Removed unused stripeLineItems variable as per ESLint error

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                // Always use a single line item for the total amount for accuracy
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Order Total' },
                        unit_amount: Math.round(parseFloat(total_amount) * 100), // Use total_amount here
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

            await client.query( // Use client
                `UPDATE checkout_orders SET stripe_session_id = $1 WHERE id = $2`,
                [session.id, order_id]
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
                session.id,
                total_amount,
                'usd'
            ];
            console.log('Attempting to insert into public.stripe_payments with params:', insertStripePaymentParams);
            await client.query(insertStripePaymentQuery, insertStripePaymentParams); // Use client
            console.log('public.stripe_payments inserted successfully with status \'pending\'.');

            await client.query('COMMIT'); // Commit the transaction if everything successful for Stripe path
            console.log('Database transaction committed successfully for Stripe order:', order_id);
            return NextResponse.json({ url: session.url });

        } else if (payment_method === 'paypal') {
            console.log('Payment method is PayPal. Order already created with PayPal IDs.');
            // For PayPal, the order is confirmed via webhook.
            // Pushing to Shiprocket here for consistency, but consider moving to PayPal webhook.
            await client.query('COMMIT'); // Commit the transaction if everything successful for PayPal path
            console.log('Database transaction committed successfully for PayPal order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });

        } else if (payment_method === 'cod') {
            console.log('Payment method is \'cod\'. Order created with initial status \'pending\'.');
            // For COD, the order is created and pushed to Shiprocket immediately.
            await client.query('COMMIT'); // Commit the transaction if everything successful for COD path
            console.log('Database transaction committed successfully for COD order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });
        }

        // If none of the payment methods matched
        if (client) { // Check if client exists before rolling back
            await client.query('ROLLBACK'); // Rollback if unsupported payment method
        }
        console.warn('Unsupported payment method received. Rolling back transaction.');
        return NextResponse.json(
            { error: 'Unsupported payment method.' },
            { status: 400 }
        );

    } catch (err: unknown) { // Use 'unknown' type for caught errors
        // If an error occurred, roll back the transaction
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error.');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        console.error('--- Checkout route FATAL error:', err);

        let errorMessage = 'An unknown error occurred';
        let errorDetails: Record<string, any> = {};

        if (err instanceof Error) { // Type guard to safely access properties of Error
            errorMessage = err.message;
            errorDetails.name = err.name;
            errorDetails.stack = err.stack;

            // Check for specific Stripe error properties if applicable
            if ('type' in err && typeof err.type === 'string') {
                errorDetails.type = err.type;
            }
            if ('statusCode' in err && typeof err.statusCode === 'number') {
                errorDetails.statusCode = err.statusCode;
            }
            if ('raw' in err && typeof err.raw === 'object' && err.raw !== null && 'message' in err.raw && typeof err.raw.message === 'string') {
                errorDetails.rawMessage = err.raw.message;
            }
        }

        console.error('Full Error Object in /api/checkout:', JSON.stringify(errorDetails, null, 2));

        return NextResponse.json(
            { error: 'Failed to process checkout', details: errorMessage },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
            console.log('Database client released.');
        }
    }
}

// Define the type for cart items to improve type safety
interface CartItem {
    sku: string;
    name: string;
    quantity: number;
    price: string; // Assuming price comes as a string from DB, then parsed
}
