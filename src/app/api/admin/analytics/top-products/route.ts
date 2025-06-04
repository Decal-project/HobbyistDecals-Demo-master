// File: app/api/admin/analytics/top-products/route.ts
import { NextResponse } from "next/server";
import  pool  from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        ci.sku,
        ci.name,
        SUM(ci.quantity) AS total_units_sold,
        SUM(ci.quantity * ci.price) AS total_sales_revenue
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN checkout_orders co ON co.cart_id = c.id
      WHERE co.total_amount IS NOT NULL
      GROUP BY ci.sku, ci.name
      ORDER BY total_units_sold DESC
      LIMIT 10;
    `;

    const { rows } = await client.query(query);
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Top products error:", error);
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 });
  }
}
