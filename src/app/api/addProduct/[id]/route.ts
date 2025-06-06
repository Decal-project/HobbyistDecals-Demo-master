import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/addProduct/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [parsedId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/addProduct/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const data = await req.json();

    const {
      type, sku, gtin, name, published, is_featured, visibility,
      short_description, description, date_sale_price_starts, date_sale_price_ends,
      tax_status, tax_class, in_stock, stock, low_stock_amount, backorders_allowed,
      sold_individually, weight_g, length_mm, width_mm, height_mm,
      allow_customer_reviews, purchase_note, sale_price, regular_price,
      categories, tags, shipping_class, images, download_limit,
      download_expiry_days, parent, grouped_products, upsells, cross_sells,
      external_url, button_text, position, brands,
      attribute_1_name, attribute_1_values, attribute_1_visible, attribute_1_global,
      attribute_2_name, attribute_2_values, attribute_2_visible, attribute_2_global,
      attribute_3_name, attribute_3_values, attribute_3_visible, attribute_3_global
    } = data;

    await pool.query(`
      UPDATE products SET
        type=$1, sku=$2, gtin=$3, name=$4, published=$5, is_featured=$6, visibility=$7,
        short_description=$8, description=$9, date_sale_price_starts=$10, date_sale_price_ends=$11,
        tax_status=$12, tax_class=$13, in_stock=$14, stock=$15, low_stock_amount=$16, backorders_allowed=$17,
        sold_individually=$18, weight_g=$19, length_mm=$20, width_mm=$21, height_mm=$22,
        allow_customer_reviews=$23, purchase_note=$24, sale_price=$25, regular_price=$26,
        categories=$27, tags=$28, shipping_class=$29, images=$30, download_limit=$31,
        download_expiry_days=$32, parent=$33, grouped_products=$34, upsells=$35, cross_sells=$36,
        external_url=$37, button_text=$38, position=$39, brands=$40,
        attribute_1_name=$41, attribute_1_values=$42, attribute_1_visible=$43, attribute_1_global=$44,
        attribute_2_name=$45, attribute_2_values=$46, attribute_2_visible=$47, attribute_2_global=$48,
        attribute_3_name=$49, attribute_3_values=$50, attribute_3_visible=$51, attribute_3_global=$52
      WHERE id = $53
    `, [
      type, sku, gtin, name, published, is_featured, visibility,
      short_description, description, date_sale_price_starts, date_sale_price_ends,
      tax_status, tax_class, in_stock, stock, low_stock_amount, backorders_allowed,
      sold_individually, weight_g, length_mm, width_mm, height_mm,
      allow_customer_reviews, purchase_note, sale_price, regular_price,
      categories, tags, shipping_class, images, download_limit,
      download_expiry_days, parent, grouped_products, upsells, cross_sells,
      external_url, button_text, position, brands,
      attribute_1_name, attribute_1_values, attribute_1_visible, attribute_1_global,
      attribute_2_name, attribute_2_values, attribute_2_visible, attribute_2_global,
      attribute_3_name, attribute_3_values, attribute_3_visible, attribute_3_global,
      parsedId
    ]);

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/addProduct/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [parsedId]);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
