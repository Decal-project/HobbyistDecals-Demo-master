import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/product?category=Some%20Category
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category") ?? "";

  // Decode and clean input
  const decodedCategory = decodeURIComponent(rawCategory)
    .replace(/\s*\(\d+\)$/, "")
    .replace(/\\/g, ""); // Remove backslashes

  console.log("🔎 Requested category (cleaned):", decodedCategory);

  try {
    const client = await pool.connect();
    const likeCategory = `%${decodedCategory}%`;
    let result;

    if (decodedCategory) {
      result = await client.query(
        `SELECT id, name,regular_price, categories, images 
         FROM products 
         WHERE REPLACE(categories, '\\', '') ILIKE $1`, // Clean DB value too
        [likeCategory]
      );
    } else {
      result = await client.query("SELECT id, name,regular_price, categories, images FROM products");
    }

    client.release();

    // Format image(s)
    const formattedRows = result.rows.map((product) => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : product.images
        ? [product.images]
        : [],
    }));

    console.log("🔍 Products matched:", formattedRows.length);
    console.log("📦 Matched data sample:", formattedRows[0]);

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
