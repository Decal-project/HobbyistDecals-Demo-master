// src/app/api/refund-paypal/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import pg from 'pg';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API_BASE_URL = 'https://api-m.sandbox.paypal.com';

async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("PayPal API credentials (Client ID or Secret) are missing from environment variables.");
        throw new Error("PayPal API credentials (Client ID or Secret) are missing from environment variables.");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to generate PayPal access token:', errorData);
        const errorMessage = errorData.error_description || response.statusText || 'Unknown error';
        throw new Error(`PayPal Access Token Error: Client Authentication failed: ${errorMessage}`);
    }

    const data = await response.json();
    return data.access_token;
}

// NEW FUNCTION: To fetch the Capture ID from a PayPal Order ID
async function getCaptureIdFromOrderId(paypalOrderId: string, accessToken: string): Promise<string | null> {
    const orderDetailsUrl = `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${paypalOrderId}`;
    console.log(`Fetching order details for PayPal Order ID: ${paypalOrderId}`);

    const response = await fetch(orderDetailsUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    console.log('PayPal Order Details Response:', data);

    if (!response.ok) {
        console.error('Failed to fetch PayPal order details:', data);
        return null;
    }

    // Look for a completed capture in the purchase_units
    if (data.purchase_units && data.purchase_units.length > 0) {
        for (const unit of data.purchase_units) {
            if (unit.payments && unit.payments.captures && unit.payments.captures.length > 0) {
                // Find the first completed capture
                const completedCapture = unit.payments.captures.find((cap: any) => cap.status === 'COMPLETED');
                if (completedCapture) {
                    return completedCapture.id;
                }
            }
        }
    }
    return null; // No completed capture found
}


async function refundPayPalOrder(captureId: string, amount: number, reason: string, accessToken: string) {
    const refundUrl = `${PAYPAL_API_BASE_URL}/v2/payments/captures/${captureId}/refund`;

    const requestBody = {
        amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
        },
        note_to_payer: reason,
    };

    console.log(`Attempting PayPal refund for Capture ID: ${captureId} with amount: ${amount}`);
    console.log('Refund Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(refundUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'PayPal-Request-Id': `REFUND-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log('PayPal Refund API Response:', responseData);

    if (!response.ok) {
        console.error("PayPal Refund API error:", responseData);
        throw new Error(`PayPal refund failed: ${responseData.message || JSON.stringify(responseData)}`);
    }

    if (responseData.status !== 'COMPLETED' && responseData.status !== 'PENDING') {
        throw new Error(`PayPal refund not completed successfully. Status: ${responseData.status}`);
    }

    return responseData;
}

export async function POST(req: Request) {
    let client: pg.PoolClient | null = null;
    try {
        const { orderId: internalOrderId, paypalOrderId, amount, reason } = await req.json();

        if (!internalOrderId || !paypalOrderId || !amount) {
            return NextResponse.json({ error: 'Missing required refund data.' }, { status: 400 });
        }

        client = await pool.connect();
        await client.query('BEGIN');
        console.log('Database transaction started for PayPal refund.');

        const accessToken = await generateAccessToken();
        console.log('PayPal Access Token generated successfully.');

        let captureId: string | null = paypalOrderId; // Assume it's a capture ID initially

        // Check if paypalOrderId looks like an Order ID (e.g., starts with "OO-")
        // You might need to refine this check based on your actual PayPal Order ID format.
        // A typical PayPal Order ID looks like '8A967812BK123456D'. Capture ID is similar.
        // The most reliable way is to store the Capture ID from the start.
        // For now, we'll try to fetch it if the refund fails, or if it doesn't look like a capture ID.
        // A better approach would be to fetch it always, or rely on a stored capture_id.

        // Let's assume if it doesn't look like a standard capture ID (e.g., if it's very short, or you know a specific prefix for orders),
        // or if the initial refund attempt fails, we try to fetch it.
        // For simplicity, let's always try to fetch capture ID if `paypalOrderId` is not definitely a capture ID.
        // A robust check: if your stored `paypalOrderId` is always the *Order ID*, then always run `getCaptureIdFromOrderId`.
        // If your stored `paypalOrderId` *could be* a Capture ID, then try refund directly, if it fails with RESOURCE_NOT_FOUND, THEN fetch.

        // Given your error, '2PF02824KX172784P' looks like a transaction ID or similar.
        // Let's implement robustly: fetch the capture ID associated with the order ID.
        // Assuming paypalOrderId passed from frontend is the main PayPal Order ID.
        console.log(`Received paypalOrderId from frontend: ${paypalOrderId}. Attempting to get Capture ID.`);
        captureId = await getCaptureIdFromOrderId(paypalOrderId, accessToken);

        if (!captureId) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Could not find a completed capture ID for the provided PayPal Order ID.' }, { status: 404 });
        }
        console.log(`Found PayPal Capture ID: ${captureId}`);

        // Perform the PayPal refund using the obtained captureId
        const refundResponse = await refundPayPalOrder(captureId, amount, reason, accessToken);
        console.log('PayPal refund initiated:', refundResponse);

        const orderResult = await client.query(
            `SELECT total_amount, affiliate_user_id FROM checkout_orders WHERE id = $1 FOR UPDATE`,
            [internalOrderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Order not found for status update.' }, { status: 404 });
        }

        const dbOrder = orderResult.rows[0];
        const originalTotalAmount = parseFloat(dbOrder.total_amount);
        const affiliateUserId = dbOrder.affiliate_user_id;

        let newStatus = 'partially_refunded';
        if (amount >= originalTotalAmount) {
            newStatus = 'refunded';
        }

        await client.query(
            `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
            [newStatus, internalOrderId]
        );
        console.log(`Order ${internalOrderId} status updated to: ${newStatus}`);

        if (affiliateUserId !== null) {
            const commissionRateResult = await client.query(
                `SELECT commission_rate FROM affiliate_users WHERE user_id = $1`,
                [affiliateUserId]
            );
            const commissionRate = commissionRateResult.rows[0]?.commission_rate || 0.10;

            const refundedCommissionAmount = amount * commissionRate;

            await client.query(
                `UPDATE affiliate_commissions
                 SET status = 'reversed', updated_at = NOW()
                 WHERE order_id = $1 AND affiliate_user_id = $2`,
                [internalOrderId, affiliateUserId]
            );
            console.log(`Affiliate commission for order ${internalOrderId} reversed.`);

            await client.query(
                `UPDATE affiliate_users
                 SET total_earnings = COALESCE(total_earnings, 0) - $1
                 WHERE user_id = $2`,
                [refundedCommissionAmount, affiliateUserId]
            );
            console.log(`Affiliate user ${affiliateUserId} earnings adjusted by -${refundedCommissionAmount}.`);
        }

        await client.query('COMMIT');
        console.log('Database transaction committed for PayPal refund.');

        return NextResponse.json({
            message: 'PayPal refund processed successfully',
            refundId: refundResponse.id,
            newStatus: newStatus,
            paypalResponse: refundResponse,
        });

    } catch (error: any) {
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.error('Database transaction rolled back due to error during PayPal refund.');
            } catch (rollbackError) {
                console.error('Error during rollback for PayPal refund:', rollbackError);
            }
        }
        console.error('--- PayPal Refund route FATAL error:', error);
        return NextResponse.json(
            { error: 'Failed to process PayPal refund', details: error.message || 'An unknown error occurred' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
            console.log('Database client released for PayPal refund.');
        }
    }
}