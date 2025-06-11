// src/app/api/refund-paypal/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import pg from 'pg';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API_BASE_URL = 'https://api-m.sandbox.paypal.com';

interface PayPalRefundResponse {
    id: string;
    status: 'COMPLETED' | 'PENDING' | string;
    [key: string]: unknown;
}

interface PayPalOrderCapture {
    id: string;
    status: string;
}

interface PayPalPurchaseUnit {
    payments?: {
        captures?: PayPalOrderCapture[];
    };
}

interface PayPalOrderResponse {
    purchase_units?: PayPalPurchaseUnit[];
    [key: string]: unknown;
}

interface RefundRequestBody {
    orderId: number;
    paypalOrderId: string;
    amount: number;
    reason: string;
}

async function generateAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("PayPal credentials are missing.");
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
        throw new Error(`PayPal Access Token Error: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function getCaptureIdFromOrderId(paypalOrderId: string, accessToken: string): Promise<string | null> {
    const url = `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${paypalOrderId}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    const data: PayPalOrderResponse = await response.json();
    if (!response.ok) return null;

    const units = data.purchase_units ?? [];
    for (const unit of units) {
        const captures = unit.payments?.captures ?? [];
        const completedCapture = captures.find(cap => cap.status === 'COMPLETED');
        if (completedCapture) return completedCapture.id;
    }

    return null;
}

async function refundPayPalOrder(captureId: string, amount: number, reason: string, accessToken: string): Promise<PayPalRefundResponse> {
    const refundUrl = `${PAYPAL_API_BASE_URL}/v2/payments/captures/${captureId}/refund`;
    const body = {
        amount: { currency_code: 'USD', value: amount.toFixed(2) },
        note_to_payer: reason,
    };

    const response = await fetch(refundUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `REFUND-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        body: JSON.stringify(body),
    });

    const responseData: PayPalRefundResponse = await response.json();

    if (!response.ok || (responseData.status !== 'COMPLETED' && responseData.status !== 'PENDING')) {
        throw new Error(`PayPal refund failed: ${JSON.stringify(responseData)}`);
    }

    return responseData;
}

export async function POST(req: Request) {
    let client: pg.PoolClient | null = null;

    try {
        const { orderId, paypalOrderId, amount, reason }: RefundRequestBody = await req.json();

        if (!orderId || !paypalOrderId || !amount) {
            return NextResponse.json({ error: 'Missing required refund data.' }, { status: 400 });
        }

        client = await pool.connect();
        await client.query('BEGIN');

        const accessToken = await generateAccessToken();
        const captureId = await getCaptureIdFromOrderId(paypalOrderId, accessToken);

        if (!captureId) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Could not find completed capture ID.' }, { status: 404 });
        }

        const result = await client.query(`
            SELECT total_amount, affiliate_user_id, COALESCE(refund_amount, 0) AS current_refund_amount, status
            FROM checkout_orders WHERE id = $1 FOR UPDATE
        `, [orderId]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const {
            total_amount,
            affiliate_user_id,
            current_refund_amount,
            status,
        }: {
            total_amount: string;
            affiliate_user_id: number | null;
            current_refund_amount: string;
            status: string;
        } = result.rows[0];

        const total = parseFloat(total_amount);
        const refunded = parseFloat(current_refund_amount);
        const remaining = total - refunded;

        if (amount <= 0 || amount > remaining) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Invalid refund amount.' }, { status: 400 });
        }

        const refundResponse = await refundPayPalOrder(captureId, amount, reason, accessToken);
        const updatedRefund = refunded + amount;
        let newStatus = status;

        if (updatedRefund.toFixed(2) === total.toFixed(2)) {
            newStatus = 'refunded';
        } else {
            newStatus = 'partially_refunded';
        }

        await client.query(`
            UPDATE checkout_orders
            SET status = $1, refund_amount = $2, updated_at = NOW()
            WHERE id = $3
        `, [newStatus, updatedRefund, orderId]);

        if (affiliate_user_id !== null) {
            const commissionResult = await client.query(`
                SELECT commission_rate FROM affiliate_users WHERE user_id = $1
            `, [affiliate_user_id]);

            const commissionRate = commissionResult.rows[0]?.commission_rate || 0.1;
            const reversedAmount = amount * commissionRate;

            await client.query(`
                UPDATE affiliate_commissions
                SET status = 'reversed', updated_at = NOW()
                WHERE order_id = $1 AND affiliate_user_id = $2
            `, [orderId, affiliate_user_id]);

            await client.query(`
                UPDATE affiliate_users
                SET total_earnings = COALESCE(total_earnings, 0) - $1
                WHERE user_id = $2
            `, [reversedAmount, affiliate_user_id]);
        }

        await client.query('COMMIT');

        return NextResponse.json({
            message: 'PayPal refund processed successfully',
            refundId: refundResponse.id,
            newStatus,
            paypalResponse: refundResponse,
        });

    } catch (error) {
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('Rollback failed:', rollbackErr);
            }
        }

        console.error('PayPal refund error:', error);
        const err = error as Error;
        return NextResponse.json(
            { error: 'Refund failed', details: err.message || 'Unknown error' },
            { status: 500 }
        );
    } finally {
        if (client) client.release();
    }
}
