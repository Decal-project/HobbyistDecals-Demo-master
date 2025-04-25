import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, name, images, product_status 
       FROM products 
       WHERE product_status = 'premium'`
    );
    client.release();

    const formattedRows = result.rows.map((product) => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : product.images
        ? [product.images]
        : [],
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error("❌ Error fetching featured products:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
