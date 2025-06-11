import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import pg from 'pg';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API_BASE_URL = 'https://api-m.sandbox.paypal.com';

async function generateAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
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
        const errorMessage = errorData.error_description || response.statusText || 'Unknown error';
        throw new Error(`PayPal Access Token Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.access_token;
}

type PayPalCapture = {
    id: string;
    status: string;
};

async function getCaptureIdFromOrderId(paypalOrderId: string, accessToken: string): Promise<string | null> {
    const orderDetailsUrl = `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${paypalOrderId}`;

    const response = await fetch(orderDetailsUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Failed to fetch PayPal order details:', data);
        return null;
    }

    if (data.purchase_units && data.purchase_units.length > 0) {
        for (const unit of data.purchase_units) {
            const captures: PayPalCapture[] | undefined = unit.payments?.captures;
            if (captures && captures.length > 0) {
                const completedCapture = captures.find((cap) => cap.status === 'COMPLETED');
                if (completedCapture) {
                    return completedCapture.id;
                }
            }
        }
    }

    return null;
}

async function refundPayPalOrder(
    captureId: string,
    amount: number,
    reason: string,
    accessToken: string
): Promise<unknown> {
    const refundUrl = `${PAYPAL_API_BASE_URL}/v2/payments/captures/${captureId}/refund`;

    const requestBody = {
        amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
        },
        note_to_payer: reason,
    };

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

    if (!response.ok) {
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

        const accessToken = await generateAccessToken();
        const captureId = await getCaptureIdFromOrderId(paypalOrderId, accessToken);

        if (!captureId) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Could not find a completed capture ID for the provided PayPal Order ID.' },
                { status: 404 }
            );
        }

        const rawRefundResponse = await refundPayPalOrder(captureId, amount, reason || 'requested_by_customer', accessToken);

        if (
            typeof rawRefundResponse !== 'object' ||
            rawRefundResponse === null ||
            !('status' in rawRefundResponse) ||
            typeof (rawRefundResponse as { status: string }).status !== 'string'
        ) {
            throw new Error('Unexpected PayPal refund response structure.');
        }

        const refundResponse = rawRefundResponse as { id: string; status: string };

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

        const newStatus = amount >= originalTotalAmount ? 'refunded' : 'partially_refunded';

        await client.query(
            `UPDATE checkout_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
            [newStatus, internalOrderId]
        );

        if (affiliateUserId !== null) {
            const commissionRateResult = await client.query(
                `SELECT commission_rate FROM affiliate_users WHERE user_id = $1`,
                [affiliateUserId]
            );

            const commissionRate = commissionRateResult.rows[0]?.commission_rate ?? 0.10;
            const refundedCommissionAmount = amount * commissionRate;

            await client.query(
                `UPDATE affiliate_commissions SET status = 'reversed', updated_at = NOW() WHERE order_id = $1 AND affiliate_user_id = $2`,
                [internalOrderId, affiliateUserId]
            );

            await client.query(
                `UPDATE affiliate_users SET total_earnings = COALESCE(total_earnings, 0) - $1 WHERE user_id = $2`,
                [refundedCommissionAmount, affiliateUserId]
            );
        }

        await client.query('COMMIT');

        return NextResponse.json({
            message: 'PayPal refund processed successfully',
            refundId: refundResponse.id,
            newStatus: newStatus,
            paypalResponse: refundResponse,
        });

    } catch (error: unknown) {
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }

        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to process PayPal refund', details: errorMessage },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
