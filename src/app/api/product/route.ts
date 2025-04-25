import { NextResponse } from "next/server";
import pool from "@/lib/db";

type Product = {
  id: number;
  name: string;
  regular_price?: number; // optional if not always present
  categories: string;
  images: string | string[];
};

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category") ?? "";

  // Decode and clean category string
  const decodedCategory = decodeURIComponent(rawCategory)
    .replace(/\s*\(\d+\)$/, "")      // remove (3), (12) etc.
    .replace(/\\/g, "");             // remove backslashes
  const simplifiedCategory = decodedCategory.split("|")[0].trim();

  console.log("🔎 Requested category (cleaned):", decodedCategory);
  console.log("🔍 Simplified match string:", simplifiedCategory);

  try {
    const client = await pool.connect();
    const likeCategory = `%${simplifiedCategory}%`;
    let result;

    if (simplifiedCategory) {
      result = await client.query(
        `SELECT id, name, regular_price, categories, images 
         FROM products 
         WHERE REPLACE(categories, '\\', '') ILIKE $1`,
        [likeCategory]
      );
    } else {
      result = await client.query(
        `SELECT id, name, regular_price, categories, images FROM products`
      );
    }

    client.release();

    const formattedRows = result.rows.map((product: Product) => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : product.images
        ? [product.images]
        : [],
    }));

    console.log("🔍 Products matched:", formattedRows.length);
    if (formattedRows.length > 0) {
      console.log("📦 Matched data sample:", formattedRows[0]);
    }

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
