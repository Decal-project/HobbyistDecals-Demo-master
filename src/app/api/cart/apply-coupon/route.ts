// app/api/cart/apply-coupon/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Assuming '@/lib/db' exports a pg.Pool instance

/**
 * Helper function to determine the quantity discount percentage.
 * MUST BE KEPT IN SYNC with the `POST /api/checkout` and `GET /api/cart` routes.
 */
function getQuantityDiscountPercentage(quantity: number): number {
    if (quantity >= 7) {
        return 0.30;
    } else if (quantity >= 5) {
        return 0.20;
    } else if (quantity >= 3) {
        return 0.10;
    }
    return 0;
}

export async function POST(req: Request) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start transaction

        const { cart_id, coupon_code } = await req.json();

        if (!cart_id || !coupon_code) {
            return NextResponse.json({ error: 'Cart ID and coupon code are required.' }, { status: 400 });
        }

        console.log(`POST /api/cart/apply-coupon: Attempting to apply coupon '${coupon_code}' to cart ${cart_id}`);

        // 1. Fetch the coupon details
        const couponRes = await client.query(
            `SELECT discount_percent FROM public.discount_codes WHERE code = $1`,
            [coupon_code]
        );

        if (couponRes.rowCount === 0) {
            await client.query('ROLLBACK');
            console.log(`POST /api/cart/apply-coupon: Coupon code '${coupon_code}' not found or invalid.`);
            return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
        }

        const couponDiscountPercent = parseFloat(couponRes.rows[0].discount_percent);
        console.log(`POST /api/cart/apply-coupon: Found coupon '${coupon_code}' with ${couponDiscountPercent}% discount.`);

        // 2. Fetch current cart details and items
        const cartRes = await client.query<{
            id: number;
            shipping_amount: string;
            discount_amount: string; // Existing coupon discount
            total_amount: string;    // Existing total
            coupon_code: string | null; // Existing applied coupon code
        }>(`SELECT id, shipping_amount, discount_amount, total_amount, coupon_code FROM carts WHERE id = $1`, [cart_id]);

        if (cartRes.rowCount === 0) {
            await client.query('ROLLBACK');
            console.warn(`POST /api/cart/apply-coupon: Cart ${cart_id} not found.`);
            return NextResponse.json({ error: 'Cart not found.' }, { status: 404 });
        }

        const currentCart = cartRes.rows[0];
        const currentShippingCost = parseFloat(currentCart.shipping_amount || '0');

        const itemsRes = await client.query<{
            sku: string;
            name: string;
            price: string; // Original unit price from DB
            quantity: number;
        }>(`SELECT sku, name, price, quantity FROM cart_items WHERE cart_id = $1`, [cart_id]);

        if (itemsRes.rowCount === 0) {
            await client.query('ROLLBACK');
            console.warn(`POST /api/cart/apply-coupon: No items found for cart ${cart_id}.`);
            return NextResponse.json({ error: 'Cart has no items.' }, { status: 400 });
        }

        let final_items_subtotal_after_quantity_discounts = 0;

        for (const item of itemsRes.rows) {
            const originalPrice = parseFloat(item.price);
            const quantity = item.quantity;
            const applicableDiscountPercentage = getQuantityDiscountPercentage(quantity);
            const discountedUnitPrice = originalPrice * (1 - applicableDiscountPercentage);
            final_items_subtotal_after_quantity_discounts += discountedUnitPrice * quantity;
        }

        // 3. Calculate new coupon discount and total
        const newCouponDiscountAmount = final_items_subtotal_after_quantity_discounts * (couponDiscountPercent / 100);
        const newSubtotalAfterAllDiscounts = final_items_subtotal_after_quantity_discounts - newCouponDiscountAmount;
        const newFinalTotalAmount = newSubtotalAfterAllDiscounts + currentShippingCost;

        console.log(`POST /api/cart/apply-coupon: New coupon discount: $${newCouponDiscountAmount.toFixed(2)}`);
        console.log(`POST /api/cart/apply-coupon: New final total: $${newFinalTotalAmount.toFixed(2)}`);

        // 4. Update the carts table
        const updateCartQuery = `
            UPDATE carts
            SET
                coupon_code = $1,
                discount_amount = $2, -- This is the coupon discount amount
                total_amount = $3
            WHERE id = $4
            RETURNING id, shipping_amount, discount_amount, total_amount, coupon_code;
        `;
        const updateCartParams = [
            coupon_code,
            newCouponDiscountAmount.toFixed(2),
            newFinalTotalAmount.toFixed(2),
            cart_id
        ];

        console.log("POST /api/cart/apply-coupon: Updating carts table with params:", updateCartParams);
        const updatedCartRes = await client.query(updateCartQuery, updateCartParams);

        await client.query('COMMIT'); // Commit transaction
        console.log(`POST /api/cart/apply-coupon: Cart ${cart_id} updated successfully with coupon '${coupon_code}'.`);

        // Respond with the updated cart data (optional, but good for frontend refresh)
        // You can choose to re-fetch the entire cart via GET /api/cart on the frontend
        // or refine this response to include more details as CartForFrontend.
        return NextResponse.json({
            success: true,
            message: `Coupon '${coupon_code}' applied.`,
            updatedCart: updatedCartRes.rows[0]
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Rollback on error
        }
        console.error("POST /api/cart/apply-coupon: Error applying coupon:", error);
        return NextResponse.json({ error: 'Failed to apply coupon.' }, { status: 500 });
    } finally {
        if (client) {
            client.release();
            console.log("POST /api/cart/apply-coupon: Database client released.");
        }
    }
}