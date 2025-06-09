import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import pool from '@/lib/db'; // Assuming '@/lib/db' exports a pg.Pool instance
import { PoolClient } from 'pg'; // Import PoolClient type from 'pg'

console.log("Stripe Secret Key being used:", process.env.STRIPE_SECRET_KEY ? "Key Found (length: " + process.env.STRIPE_SECRET_KEY.length + ")" : "Key NOT Found!");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15' as Stripe.LatestApiVersion,
});

// Define interfaces for better type safety of incoming request payload
interface CheckoutPayload {
    billing_first_name: string;
    billing_last_name: string;
    billing_company_name?: string; // Optional field
    billing_country: string;
    billing_street_address: string;
    billing_city: string;
    billing_state: string;
    billing_postal_code: string;
    billing_phone: string;
    billing_email: string;
    ship_to_different_address: boolean;
    shipping_first_name?: string; // Optional field, depends on ship_to_different_address
    shipping_last_name?: string;
    shipping_company_name?: string;
    shipping_country?: string;
    shipping_street_address?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_phone?: string;
    shipping_email?: string;
    order_notes?: string; // Optional field
    payment_method: 'stripe' | 'paypal' | 'cod'; // Enforce specific payment methods
    total_amount: number;
    cart_id: string; // Crucial for fetching cart items
    paypal_order_id?: string; // Optional, specific to PayPal
    paypal_payer_id?: string; // Optional, specific to PayPal
}

// Interface for cart items fetched from the database
interface CartItem {
    sku: string;
    name: string;
    quantity: number;
    price: string; // Stored as string in DB, will be parsed to float/number
}

// Interface for Shiprocket API response, including potential error structures
interface ShiprocketApiResponse {
    status?: string;
    message?: string;
    errors?: Record<string, string[]> | Array<{ message: string; errors?: Record<string, string[]> }>; // Shiprocket can have varied error formats
    // Removed 'data: any;' as it was unused and a source of 'any' type.
}

// Define a more comprehensive error interface to cover potential properties
// like statusCode (for HTTP errors) or raw (for Stripe-specific errors).
interface CustomError extends Error {
    statusCode?: number;
    raw?: {
        message: string;
        type?: string; // e.g., 'StripeCardError'
        code?: string; // e.g., 'card_declined'
        // Add other properties you might expect in `raw` from specific API errors
    };
    // Add other custom error properties if your application defines them
}

// Type guard to check if an unknown error is an instance of CustomError,
// allowing TypeScript to narrow the type and access custom properties safely.
function isCustomError(err: unknown): err is CustomError {
    return err instanceof Error; // Basic check, extend if more specific error classes are used
}


export async function POST(req: Request) {
    let client: PoolClient | null = null; // Declare client with specific type and initial null
    try {
        // Acquire a client from the connection pool
        client = await pool.connect();
        // Start a database transaction to ensure atomicity of operations
        await client.query('BEGIN');
        console.log('Database transaction started.');

        let affiliate_user_id: number | null = null;
        // Access cookies using next/headers cookies() function
        const cookieStore = cookies();
        const affiliateCodeCookie = cookieStore.get('affiliate_code');

        console.log(`Cookie check: affiliate_code cookie found?`, !!affiliateCodeCookie);
        if (affiliateCodeCookie) {
            const { value: affiliateCode } = affiliateCodeCookie;
            try {
                // Query the database to find the affiliate user ID associated with the code
                const { rows } = await client.query(
                    `SELECT user_id FROM affiliate_links WHERE code = $1`,
                    [affiliateCode]
                );
                if (rows.length > 0) {
                    affiliate_user_id = rows[0].user_id;
                    console.log(`Affiliate user ID found from cookie: ${affiliate_user_id}`);
                } else {
                    console.warn(`Affiliate code '${affiliateCode}' found in cookie but not in affiliate_links table.`);
                }
            } catch (dbError: unknown) { // Catch unknown errors for robust handling
                if (dbError instanceof Error) {
                    console.error("Error fetching affiliate user ID from affiliate_links:", dbError.message);
                } else {
                    console.error("Unknown error fetching affiliate user ID from affiliate_links:", dbError);
                }
                // Continue execution, as this is not a critical error for order creation, but log it.
            }
        }
        console.log(`Final affiliate_user_id for insert into checkout_orders:`, affiliate_user_id);

        // Parse the incoming JSON request body and assert its type
        const data: CheckoutPayload = await req.json(); // Explicitly type for compile-time safety
        console.log('Incoming checkout payload:', data);

        // Destructure necessary fields from the request payload
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

        // Basic validation for essential fields
        if (!billing_first_name || !billing_last_name || !billing_email || !total_amount || !cart_id) {
            await client.query('ROLLBACK'); // Rollback transaction if validation fails
            console.warn('Missing required billing, total amount, or cart information. Rolling back transaction.');
            return NextResponse.json(
                { error: 'Missing required billing, total amount, or cart information.' },
                { status: 400 }
            );
        }

        let initialOrderStatus = 'pending';
        let initialCommissionStatus = 'pending'; // Default initial status for commissions

        let stripeSessionId: string | null = null;
        let finalPaypalOrderId: string | null = null;
        let finalPaypalPayerId: string | null = null;

        // Set initial status based on payment method
        if (payment_method === 'paypal') {
            finalPaypalOrderId = paypal_order_id || null;
            finalPaypalPayerId = paypal_payer_id || null;
            initialOrderStatus = 'pending'; // Awaiting webhook confirmation for capture
            initialCommissionStatus = 'pending'; // Will be 'earned' on capture.completed webhook
        } else if (payment_method === 'cod') {
            initialOrderStatus = 'on-hold'; // COD orders typically start as 'on-hold' or 'pending'
            initialCommissionStatus = 'on-hold'; // Commission also on-hold for COD until confirmed
        }
        // For 'stripe', initialOrderStatus defaults to 'pending' as set above, to be confirmed by webhook

        // SQL query to insert a new order into the checkout_orders table
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

        // Parameters for the insert order query
        const insertOrderParams = [
            billing_first_name, billing_last_name, billing_company_name, billing_country,
            billing_street_address, billing_city, billing_state, billing_postal_code,
            billing_phone, billing_email, ship_to_different_address,
            shipping_first_name, shipping_last_name, shipping_company_name, shipping_country,
            shipping_street_address, shipping_city, shipping_state, shipping_postal_code,
            shipping_phone, shipping_email, order_notes, payment_method, total_amount, cart_id,
            stripeSessionId, // Will be null initially, updated later for Stripe
            finalPaypalOrderId, // Will be null for Stripe/COD
            finalPaypalPayerId, // Will be null for Stripe/COD
            affiliate_user_id,
            initialOrderStatus
        ];

        console.log('Attempting to insert into checkout_orders with params:', insertOrderParams);

        // Execute the insert order query and get the new order ID
        const { rows: orderRows } = await client.query(
            insertOrderQuery,
            insertOrderParams
        );
        const order_id = orderRows[0].id;
        console.log(`New Order ID created: ${order_id} with initial status: ${initialOrderStatus}`);

        // --- FETCH CART ITEMS FOR SHIPROCKET & STRIPE LINE ITEMS ---
        // Fetch items from the cart_items table using the provided cart_id
        const { rows: cartItems }: { rows: CartItem[] } = await client.query(
            `SELECT
                sku,
                name,
                quantity,
                price
            FROM public.cart_items
            WHERE cart_id = $1`,
            [cart_id]
        );

        // If no items are found in the cart, rollback the transaction
        if (cartItems.length === 0) {
            console.warn(`No items found in cart_items for cart_id: ${cart_id}. This order cannot be processed without items.`);
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Cart is empty or invalid. Cannot create order.' }, { status: 400 });
        }

        // Format cart items for Shiprocket API payload
        const shiprocketOrderItems = cartItems.map((item: CartItem) => ({ // Type item explicitly
            name: item.name,
            sku: item.sku,
            units: item.quantity,
            selling_price: parseFloat(item.price), // Convert string price to number
            // Additional Shiprocket fields can be added here if available:
            // hsn: "HSNCODE",
            // tax: 0,
            // discount: 0,
            // product_tax: 0,
        }));
        console.log('Formatted Shiprocket order_items:', shiprocketOrderItems);
        // --- END FETCH CART ITEMS ---


        // --- COMMISSION CALCULATION AND INSERTION LOGIC ---
        if (affiliate_user_id !== null) {
            console.log(`Order ${order_id} has an associated affiliate user ID: ${affiliate_user_id}. Calculating commission.`);

            const commissionRate = 0.10; // Example commission rate
            const commissionAmount = total_amount * commissionRate;
            const currency = 'usd';

            try {
                // Insert the calculated commission into the affiliate_commissions table
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

                // Update total earnings for the affiliate user if the commission status allows immediate earning
                if (initialCommissionStatus === 'earned' || initialCommissionStatus === 'paid') {
                    await client.query(
                        `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) + $1 WHERE user_id = $2`,
                        [commissionAmount, affiliate_user_id]
                    );
                    console.log(`Affiliate ${affiliate_user_id} total earnings updated in affiliate_users table.`);
                }

            } catch (commissionDbError: unknown) { // Catch potential errors during commission insertion/update
                if (commissionDbError instanceof Error) {
                    console.error("Error inserting affiliate commission or updating total earnings:", commissionDbError.message);
                } else {
                    console.error("Unknown error inserting affiliate commission or updating total earnings:", commissionDbError);
                }
                // Re-throw the error to trigger the main catch block and rollback the entire transaction
                throw commissionDbError;
            }
        }
        // --- END COMMISSION LOGIC ---

        // --- SHIPROCKET PUSH LOGIC ---
        // Pushing to Shiprocket immediately for COD and PayPal orders.
        // For Stripe, it's generally recommended to push to Shiprocket after payment confirmation via webhook.
        if (payment_method === 'cod' || payment_method === 'paypal') {
            console.log(`Attempting to push order ${order_id} to Shiprocket for ${payment_method}.`);
            try {
                // Construct the Shiprocket API payload
                const shiprocketPayload = {
                    order_id: `order-${order_id}`, // Unique order ID for Shiprocket
                    order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
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
                    billing_company_name: billing_company_name || "", // Handle optional company name

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

                    payment_method: payment_method === 'cod' ? 'COD' : 'Prepaid', // Map to Shiprocket's payment method types
                    total_amount: total_amount,
                    sub_total: total_amount, // Assuming subtotal is same as total_amount for simplicity here
                    shipping_is_billing: ship_to_different_address ? 0 : 1, // 0 for different, 1 for same address
                    length: 10, // Placeholder values, ideally dynamically calculated
                    breadth: 10,
                    height: 10,
                    weight: 0.5, // Placeholder value, ideally dynamically calculated
                    order_items: shiprocketOrderItems, // Populated from cart items
                };

                // Call your internal API route for Shiprocket integration
                const shiprocketResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/shiprocket/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shiprocketPayload),
                });

                const shiprocketData: ShiprocketApiResponse = await shiprocketResponse.json(); // Explicitly type the response
                if (!shiprocketResponse.ok) {
                    console.error('[Shiprocket API Error Response]:', shiprocketData);
                    // Extract a meaningful error message from Shiprocket's response
                    const errorMessage = shiprocketData.message || JSON.stringify(shiprocketData.errors || 'Unknown Shiprocket error');
                    throw new Error(`Shiprocket API Error: ${errorMessage}`);
                }
                console.log('[Shiprocket API Success Response]:', shiprocketData);

            } catch (shiprocketError: unknown) { // Catch unknown errors
                if (shiprocketError instanceof Error) {
                    console.error('[Shiprocket Push Failure]:', shiprocketError.message);
                } else {
                    console.error('[Shiprocket Push Failure]: An unknown error occurred.', shiprocketError);
                }
                // Decide if a failed Shiprocket push should rollback the order.
                // For now, logging and continuing, but uncomment the lines below if critical.
                // await client.query('ROLLBACK');
                // return NextResponse.json({ error: 'Failed to integrate with shipping partner. Please try again.' }, { status: 500 });
            }
        }
        // --- END SHIPROCKET PUSH ---


        // --- PAYMENT METHOD SPECIFIC LOGIC ---
        if (payment_method === 'stripe') {
            console.log('Payment method is Stripe. Proceeding with Stripe session creation.');
            console.log('Stripe Session Metadata:', { order_id: String(order_id), cart_id: String(cart_id) });

            // Prepare line items for Stripe Checkout Session
            const stripeLineItems = cartItems.map((item: CartItem) => ({
                price_data: {
                    currency: 'usd', // Assuming USD currency
                    product_data: { name: item.name || 'Product' }, // Use actual product name, fallback to 'Product'
                    unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents (Stripe requires integer)
                },
                quantity: item.quantity,
            }));

            // Fallback: If cartItems is empty (though already validated above), create a single line item for the total amount
            const line_items = stripeLineItems.length > 0 ? stripeLineItems : [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Order Total' },
                    unit_amount: Math.round(total_amount * 100),
                },
                quantity: 1,
            }];

            // Create a Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'], // Only allow card payments
                line_items,
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout`,
                metadata: { // Attach metadata to the Stripe session for later lookup in webhooks
                    order_id: String(order_id),
                    cart_id: String(cart_id),
                    affiliate_user_id: affiliate_user_id ? String(affiliate_user_id) : undefined,
                },
            });

            stripeSessionId = session.id; // Assign the Stripe session ID
            console.log(`Stripe session created: ${stripeSessionId}`);
            console.log(`Updating checkout_orders (ID: ${order_id}) with stripe_session_id: ${stripeSessionId}`);

            // Update the order in the database with the Stripe session ID
            await client.query(
                `UPDATE checkout_orders SET stripe_session_id = $1 WHERE id = $2`,
                [stripeSessionId, order_id]
            );
            console.log('checkout_orders updated with stripe_session_id.');

            // Insert a record into public.stripe_payments to track this payment attempt
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
                total_amount,
                'usd' // Assuming USD
            ];
            console.log('Attempting to insert into public.stripe_payments with params:', insertStripePaymentParams);
            await client.query(insertStripePaymentQuery, insertStripePaymentParams);
            console.log('public.stripe_payments inserted successfully with status \'pending\'.');

            await client.query('COMMIT'); // Commit the transaction for Stripe path
            console.log('Database transaction committed successfully for Stripe order:', order_id);
            return NextResponse.json({ url: session.url }); // Return the Stripe Checkout URL

        } else if (payment_method === 'paypal') {
            console.log('Payment method is PayPal. Order already created with PayPal IDs.');
            // For PayPal, the order is typically confirmed via webhook after payment completion.
            // Pushing to Shiprocket logic is already handled above for PayPal.
            await client.query('COMMIT'); // Commit the transaction for PayPal path
            console.log('Database transaction committed successfully for PayPal order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });

        } else if (payment_method === 'cod') {
            console.log('Payment method is \'cod\'. Order created with initial status \'on-hold\'.');
            // For COD, the order is created and pushed to Shiprocket immediately (handled above).
            await client.query('COMMIT'); // Commit the transaction for COD path
            console.log('Database transaction committed successfully for COD order:', order_id);
            return NextResponse.json({ success: true, order_id: order_id });
        }

        // If none of the recognized payment methods matched, rollback and return an error
        await client.query('ROLLBACK');
        console.warn('Unsupported payment method received. Rolling back transaction.');
        return NextResponse.json(
            { error: 'Unsupported payment method.' },
            { status: 400 }
        );

    } catch (err: unknown) { // Catch block to handle any errors during the process
        // If an error occurred, attempt to roll back the database transaction
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error.');
            } catch (rollbackError: unknown) { // Handle errors during rollback itself
                if (rollbackError instanceof Error) {
                    console.error('Error during rollback:', rollbackError.message);
                } else {
                    console.error('Unknown error during rollback:', rollbackError);
                }
            }
        }
        console.error('--- Checkout route FATAL error:', err);

        let errorMessage = 'An unknown error occurred';
        if (isCustomError(err)) { // Use the custom type guard here
            errorMessage = err.message;
            console.error('Error Type:', err.name); // Log the type of error (e.g., 'Error', 'TypeError')

            // Safely access properties that might exist on CustomError
            if (typeof err.statusCode === 'number') {
                console.error('Status Code:', err.statusCode);
            }
            if (err.raw && typeof err.raw === 'object' && typeof err.raw.message === 'string') {
                console.error('Raw Message:', err.raw.message);
                if (err.raw.type) {
                    console.error('Raw Type:', err.raw.type);
                }
                if (err.raw.code) {
                    console.error('Raw Code:', err.raw.code);
                }
            }
        } else if (err instanceof Error) {
            // Fallback for standard Error objects not covered by CustomError interface
            errorMessage = err.message;
            console.error('Standard Error:', err.message);
        }

        // Log the full error object for comprehensive debugging.
        // Using Object.getOwnPropertyNames ensures non-enumerable properties are also stringified.
        console.error('Full Error Object in /api/checkout:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

        // Return a generic error response to the client
        return NextResponse.json(
            { error: 'Failed to process checkout', details: errorMessage },
            { status: 500 }
        );
    } finally {
        // Ensure the database client is released back to the pool, regardless of success or failure
        if (client) {
            client.release();
            console.log('Database client released.');
        }
    }
}
