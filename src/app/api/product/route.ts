export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category") ?? "";

  // Clean category string like "Cars (3)" => "Cars"
  const decodedCategory = decodeURIComponent(rawCategory).replace(/\s*\(\d+\)$/, "");
  console.log("🔎 Requested category (cleaned):", decodedCategory);

  try {
    let result;

    if (decodedCategory) {
      result = await pool.query(
        `SELECT id, name, categories, images FROM products WHERE categories ILIKE $1`,
        [`%${decodedCategory}%`] // fixed SQL query + parameter binding
      );
    } else {
      result = await pool.query(
        `SELECT id, name, categories, images FROM products`
      );
    }

    const formattedRows = result.rows.map((product: any) => ({
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
