// app/api/addproduct/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Import your DB connection

const PRODUCT_FIELDS = [
  "type", "sku", "gtin", "name", "published", "is_featured", "visibility",
  "short_description", "description", "date_sale_price_starts", "date_sale_price_ends",
  "tax_status", "tax_class", "in_stock", "stock", "low_stock_amount", "backorders_allowed",
  "sold_individually", "weight_g", "length_mm", "width_mm", "height_mm",
  "allow_customer_reviews", "purchase_note", "sale_price", "regular_price",
  "categories", "tags", "shipping_class", "images", "download_limit",
  "download_expiry_days", "parent", "grouped_products", "upsells", "cross_sells",
  "external_url", "button_text", "position", "brands",
  "attribute_1_name", "attribute_1_values", "attribute_1_visible", "attribute_1_global",
  "attribute_2_name", "attribute_2_values", "attribute_2_visible", "attribute_2_global",
  "attribute_3_name", "attribute_3_values", "attribute_3_visible", "attribute_3_global",
  "category", "brand", "price", "imageUrl"
];

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('GET /api/addproduct error', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const values = PRODUCT_FIELDS.map(key => {
      const v = data[key];
      return Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v;
    });
    const placeholders = PRODUCT_FIELDS.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO products (${PRODUCT_FIELDS.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/addproduct error', err);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // build SET clause only for provided fields
    const keys = PRODUCT_FIELDS.filter(f => data[f] !== undefined);
    const setClause = keys.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = keys.map(f => {
      const v = data[f];
      return Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v;
    });

    // add id as last parameter
    values.push(id);

    const result = await pool.query(
      `UPDATE products SET ${setClause}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/addproduct error', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/addproduct error', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
