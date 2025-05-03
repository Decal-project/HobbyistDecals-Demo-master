// app/api/cart/save/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// configure your PG pool (make sure env var is set)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    const { cartItems, shippingAmount } = await req.json()

    if (
      !Array.isArray(cartItems) ||
      typeof shippingAmount !== 'number' ||
      shippingAmount < 0
    ) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 1) create the cart and store shipping_amount
      const insertCart   = await client.query< { id: number } >(
        `INSERT INTO carts (shipping_amount)
         VALUES ($1)
         RETURNING id`,
        [shippingAmount]
      )
      const cartId = insertCart.rows[0].id

      // 2) insert each cart_item
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

        // you may wish to validate each field here...

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
        { error: 'Failed to save cart' },
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
