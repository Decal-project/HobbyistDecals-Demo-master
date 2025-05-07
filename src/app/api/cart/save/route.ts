import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// configure your PG pool (make sure env var is set)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    const { cartItems, shippingAmount, discountAmount } = await req.json()

    // Validate incoming payload
    if (
      !Array.isArray(cartItems) ||
      typeof shippingAmount !== 'number' ||
      shippingAmount < 0 ||
      (discountAmount !== undefined && (typeof discountAmount !== 'number' || discountAmount < 0))
    ) {
      return NextResponse.json(
        { error: 'Invalid payload, ensure shippingAmount and discountAmount are non-negative numbers' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Calculate the total amount
      let totalAmount = 0
      for (const item of cartItems) {
        const { price, quantity } = item
        if (typeof price !== 'number' || typeof quantity !== 'number' || price < 0 || quantity < 1) {
          return NextResponse.json({ error: 'Invalid cart item data' }, { status: 400 })
        }
        totalAmount += price * quantity
      }

      // Add shipping and subtract discount
      totalAmount += shippingAmount
      totalAmount -= discountAmount || 0

      // Ensure total amount is not negative
      if (totalAmount < 0) {
        return NextResponse.json({ error: 'Total amount cannot be negative' }, { status: 400 })
      }

      // Debugging: Log values
      console.log('Inserting cart with values:', {
        shippingAmount,
        totalAmount,
        discountAmount
      })

      // 1) Create the cart and store shipping_amount, total_amount, and discount_amount
      const insertCart = await client.query<{ id: number }>(
        `INSERT INTO carts (shipping_amount, total_amount, discount_amount)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [shippingAmount, totalAmount, discountAmount || 0]
      )

      console.log('Insert result:', insertCart.rows)

      const cartId = insertCart.rows[0].id

      // 2) Insert each cart_item
      const itemStmt = `
        INSERT INTO cart_items
          (cart_id, sku, name, price, media, scale, variation, quantity, image)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `
      for (const item of cartItems) {
        const {
          sku,
          name,
          price,
          media,
          scale,
          variation,
          quantity,
          image,
        } = item

        await client.query(itemStmt, [
          cartId,
          sku,
          name,
          price,
          media,
          scale,
          variation,
          quantity,
          image,
        ])
      }

      await client.query('COMMIT')
      return NextResponse.json(
        { message: 'Cart saved', cartId },
        { status: 201 }
      )
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Transaction error:', err)
      return NextResponse.json(
        { error: 'Failed to save cart due to a server issue' },
        { status: 500 }
      )
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    )
  }
}
