// app/api/cart/route.ts (GET request for cart display)
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Re-defining the frontend interfaces here for clarity and type safety in the backend
interface CartItemForFrontend {
  sku: string;
  name: string;
  quantity: number;
  price_for_display: number; // Unit price after quantity discounts
}

interface CartForFrontend {
  id: number;
  subtotal_after_quantity_discounts: number; // Subtotal AFTER quantity discounts, BEFORE coupon/shipping
  total_quantity_discount_amount: number; // Total amount of quantity discounts applied
  coupon_discount_amount: number; // Total amount of coupon discount applied
  shipping_cost: number;
  final_total_amount: number; // subtotal_after_quantity_discounts - coupon_discount_amount + shipping_cost
  coupon_code_applied: string | null;
  items: CartItemForFrontend[];
}

/**
 * Helper function to determine the quantity discount percentage.
 * MUST BE KEPT IN SYNC with the `POST /api/checkout` route.
 * @param quantity The quantity of a single product.
 * @returns The discount percentage (e.g., 0.10 for 10%, 0.20 for 20%).
 */
function getQuantityDiscountPercentage(quantity: number): number {
    if (quantity >= 7) {
        return 0.30; // 30% off for 7 or more units
    } else if (quantity >= 5) {
        return 0.20; // 20% off for 5-6 units
    } else if (quantity >= 3) {
        return 0.10; // 10% off for 3-4 units
    }
    return 0; // No discount for quantities less than 3
}

export async function GET() {
  const client = await pool.connect();
  try {
    // 1. Grab the most recent cart data from the database
    const cartRes = await client.query<{
      id: number;
      shipping_amount: string;
      discount_amount: string; // This is the coupon discount amount from the cart row
      total_amount: string; // This should be the final total after all calculations
      coupon_code: string | null; // Assuming you store the applied coupon code
      created_at: string;
    }>(
      `SELECT id, shipping_amount, discount_amount, total_amount, coupon_code, created_at
          FROM carts
          ORDER BY created_at DESC
          LIMIT 1`
    );

    if (cartRes.rowCount === 0) {
      console.log("GET /api/cart: No cart found in the database. Returning empty cart.");
      return NextResponse.json({
        id: -1,
        subtotal_after_quantity_discounts: 0,
        total_quantity_discount_amount: 0,
        coupon_discount_amount: 0,
        shipping_cost: 0,
        final_total_amount: 0,
        coupon_code_applied: null,
        items: [],
      } as CartForFrontend);
    }

    const rawCart = cartRes.rows[0];
    console.log("GET /api/cart: Raw Cart Data from DB:", rawCart);

    // 2. Grab its items
    const itemsRes = await client.query<{
      sku: string;
      name: string;
      price: string; // Original unit price from DB
      quantity: number;
    }>(
      `SELECT sku, name, price, quantity
          FROM cart_items
          WHERE cart_id = $1`,
      [rawCart.id]
    );

    console.log("GET /api/cart: Raw Cart Items from DB:", itemsRes.rows);

    let calculatedSubtotalAfterQuantityDiscounts = 0;
    let totalOriginalPriceSum = 0;
    const itemsForFrontend: CartItemForFrontend[] = itemsRes.rows.map(item => {
      const originalPrice = parseFloat(item.price);
      const quantity = item.quantity;
      totalOriginalPriceSum += (originalPrice * quantity);

      // Apply the same quantity discount logic used in POST route
      const applicableDiscountPercentage = getQuantityDiscountPercentage(quantity);
      const priceForDisplay = originalPrice * (1 - applicableDiscountPercentage);

      calculatedSubtotalAfterQuantityDiscounts += (priceForDisplay * quantity);

      console.log(`GET /api/cart: Item '${item.name}': Original Price: ${originalPrice}, Qty: ${quantity}, Discount %: ${applicableDiscountPercentage * 100}%, Price For Display: ${priceForDisplay.toFixed(2)}`);

      return {
        sku: item.sku,
        name: item.name,
        quantity: quantity,
        price_for_display: parseFloat(priceForDisplay.toFixed(2)), // Ensure 2 decimal places
      };
    });

    // Calculate total quantity discount amount based on re-calculated subtotal
    const totalQuantityDiscountAmount = totalOriginalPriceSum - calculatedSubtotalAfterQuantityDiscounts;

    // Parse values from DB, ensure they are numbers. These should now be accurate from the POST route.
    const couponDiscountAmount = parseFloat(rawCart.discount_amount || '0'); // Default to 0 if null/undefined
    const shippingCost = parseFloat(rawCart.shipping_amount || '0');
    const finalTotalAmount = parseFloat(rawCart.total_amount || '0');

    // Construct the CartForFrontend object
    const cartForFrontend: CartForFrontend = {
      id: rawCart.id,
      subtotal_after_quantity_discounts: parseFloat(calculatedSubtotalAfterQuantityDiscounts.toFixed(2)),
      total_quantity_discount_amount: parseFloat(totalQuantityDiscountAmount.toFixed(2)),
      coupon_discount_amount: parseFloat(couponDiscountAmount.toFixed(2)),
      shipping_cost: parseFloat(shippingCost.toFixed(2)),
      final_total_amount: parseFloat(finalTotalAmount.toFixed(2)),
      coupon_code_applied: rawCart.coupon_code,
      items: itemsForFrontend,
    };

    console.log("GET /api/cart: Final CartForFrontend object sent to frontend:", cartForFrontend);

    return NextResponse.json(cartForFrontend);

  } catch (e) {
    console.error("GET /api/cart: Error fetching cart:", e);
    if (e instanceof Error) {
      console.error("GET /api/cart: Error details:", e.message, e.stack);
    }
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  } finally {
    client.release();
    console.log("GET /api/cart: Database client released.");
  }
}