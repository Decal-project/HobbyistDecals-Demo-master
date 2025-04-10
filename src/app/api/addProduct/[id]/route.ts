import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Update product by ID
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const data = await req.json();
  const { name, brand, price, category, description, imageUrl, stock } = data;

  try {
    const result = await pool.query(
      `UPDATE products 
       SET name=$1, brand=$2, price=$3, category=$4, description=$5, image_url=$6, stock=$7
       WHERE id=$8 RETURNING *`,
      [name, brand, price, category, description, imageUrl, stock, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// Delete product by ID
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
