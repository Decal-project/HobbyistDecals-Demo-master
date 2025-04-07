import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/product?category=Some%20Category
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category") ?? "";

  // Decode and strip trailing (number), e.g., "Cars (3)" → "Cars"
  const decodedCategory = decodeURIComponent(rawCategory).replace(/\s*\(\d+\)$/, "");
  console.log("🔎 Requested category (cleaned):", decodedCategory);

  try {
    const client = await pool.connect();
    const likeCategory = `%${decodedCategory}%`;
    let result;

    if (decodedCategory) {
      result = await client.query(
        "SELECT id, name, categories, images FROM products WHERE categories ILIKE $1",
        [likeCategory]
      );
    } else {
      result = await client.query("SELECT id, name, categories, images FROM products");
    }

    client.release();

    // 🔧 Ensure images is always an array of full URLs
    const formattedRows = result.rows.map((product: { images: any; }) => ({
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
