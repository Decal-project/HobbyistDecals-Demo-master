// app/api/cart/route.ts
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const client = await pool.connect()
  try {
    // 1) Grab the most recent cart, including the discount_amount
    const cartRes = await client.query<{
      id: number
      shipping_amount: string
      discount_amount: string // Added discount_amount field
      created_at: string
    }>(
      `SELECT id, shipping_amount, discount_amount, created_at
       FROM carts
       ORDER BY created_at DESC
       LIMIT 1`
    )

    if (cartRes.rowCount === 0) {
      return NextResponse.json({ cart: null, items: [] })
    }

    const cart = cartRes.rows[0]

    // 2) Grab its items
    const itemsRes = await client.query<{
      sku: string
      name: string
      price: string
      quantity: number
    }>(
      `SELECT sku, name, price, quantity
       FROM cart_items
       WHERE cart_id = $1`,
      [cart.id]
    )

    return NextResponse.json({
      cart: {
        ...cart,
        shipping_amount: parseFloat(cart.shipping_amount),
        discount_amount: parseFloat(cart.discount_amount), // Parse the discount_amount
      },
      items: itemsRes.rows.map((r) => ({
        ...r,
        price: parseFloat(r.price),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 })
  } finally {
    client.release()
  }
}
