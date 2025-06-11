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

        console.log(`Received paypalOrderId from frontend: ${paypalOrderId}. Attempting to get Capture ID.`);
        captureId = await getCaptureIdFromOrderId(paypalOrderId, accessToken);

        if (!captureId) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Could not find a completed capture ID for the provided PayPal Order ID.' }, { status: 404 });
        }
        console.log(`Found PayPal Capture ID: ${captureId}`);

        const orderResult = await client.query(
            `SELECT total_amount, affiliate_user_id, COALESCE(refund_amount, 0) as current_refund_amount, status
             FROM checkout_orders WHERE id = $1 FOR UPDATE`,
            [internalOrderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Order not found for status update.' }, { status: 404 });
        }

        const dbOrder = orderResult.rows[0];
        const originalTotalAmount = parseFloat(dbOrder.total_amount);
        const affiliateUserId = dbOrder.affiliate_user_id;
        const currentRefundAmount = parseFloat(dbOrder.current_refund_amount);
        const remainingRefundableAmount = originalTotalAmount - currentRefundAmount;

        if (parseFloat(amount) <= 0) {
            await client.query('ROLLBACK');
            console.warn(`PayPal Refund: Refund amount must be greater than zero for order ${internalOrderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Refund amount must be greater than zero.' }, { status: 400 });
        }

        if (parseFloat(amount) > remainingRefundableAmount) {
            await client.query('ROLLBACK');
            console.warn(`PayPal Refund: Refund amount exceeds remaining balance for order ${internalOrderId}. Rolling back transaction.`);
            return NextResponse.json({ error: 'Refund amount exceeds the remaining refundable amount.' }, { status: 400 });
        }

        // Perform the PayPal refund using the obtained captureId
        const refundResponse = await refundPayPalOrder(captureId, amount, reason, accessToken);
        console.log('PayPal refund initiated:', refundResponse);

        const newTotalRefundedAmount = currentRefundAmount + parseFloat(amount);
        let newStatus = dbOrder.status;

        if (refundResponse.status === 'COMPLETED' || refundResponse.status === 'PENDING') {
            if (newTotalRefundedAmount.toFixed(2) === originalTotalAmount.toFixed(2)) {
                newStatus = 'refunded';
            } else if (newTotalRefundedAmount > 0) {
                newStatus = 'partially_refunded';
            }
        } else {
            console.warn(`PayPal Refund: Unexpected refund status from PayPal API: ${refundResponse.status}`);
            newStatus = 'refund_processing_error';
        }

        await client.query(
            `UPDATE checkout_orders SET status = $1, refund_amount = $2, updated_at = NOW() WHERE id = $3`,
            [newStatus, newTotalRefundedAmount, internalOrderId]
        );
        console.log(`Order ${internalOrderId} status updated to: ${newStatus}, Refund amount updated to: ${newTotalRefundedAmount}`);

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
