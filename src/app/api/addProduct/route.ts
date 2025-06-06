import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Helper functions
function toBooleanInt(val: string | number | boolean | null): number {
  return val === '1' || val === 1 || val === true || val === 'true' ? 1 : 0;
}

function toNumberOrNull(val: string | null): number | null {
  if (val === null || val === '' || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function getOrNull(formData: FormData, key: string): string | null {
  const val = formData.get(key);
  if (!val) return null;
  const str = val.toString().trim();
  return str === '' ? null : str;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // --- Handle image file ---
    const imageFile = formData.get('images') as File | null;
    let imagePath: string | null = null;

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExt = path.extname(imageFile.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');

      // Create uploads dir if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imagePath = `/uploads/${fileName}`; // Save this to DB
    }

    const values = [
      toNumberOrNull(getOrNull(formData, 'id')),
      getOrNull(formData, 'type'),
      getOrNull(formData, 'sku'),
      getOrNull(formData, 'gtin'),
      getOrNull(formData, 'name'),
      toBooleanInt(getOrNull(formData, 'published')),
      toBooleanInt(getOrNull(formData, 'is_featured')),
      getOrNull(formData, 'visibility'),
      getOrNull(formData, 'short_description'),
      getOrNull(formData, 'description'),
      getOrNull(formData, 'date_sale_price_starts'),
      getOrNull(formData, 'date_sale_price_ends'),
      getOrNull(formData, 'tax_status'),
      getOrNull(formData, 'tax_class'),
      toBooleanInt(getOrNull(formData, 'in_stock')),
      toNumberOrNull(getOrNull(formData, 'stock')),
      toNumberOrNull(getOrNull(formData, 'low_stock_amount')),
      toBooleanInt(getOrNull(formData, 'backorders_allowed')),
      toBooleanInt(getOrNull(formData, 'sold_individually')),
      toNumberOrNull(getOrNull(formData, 'weight_g')),
      toNumberOrNull(getOrNull(formData, 'length_mm')),
      toNumberOrNull(getOrNull(formData, 'width_mm')),
      toNumberOrNull(getOrNull(formData, 'height_mm')),
      toBooleanInt(getOrNull(formData, 'allow_customer_reviews')),
      getOrNull(formData, 'purchase_note'),
      toNumberOrNull(getOrNull(formData, 'sale_price')),
      toNumberOrNull(getOrNull(formData, 'regular_price')),
      getOrNull(formData, 'categories'),
      getOrNull(formData, 'tags'),
      getOrNull(formData, 'shipping_class'),
      imagePath,
      toNumberOrNull(getOrNull(formData, 'download_limit')),
      toNumberOrNull(getOrNull(formData, 'download_expiry_days')),
      toNumberOrNull(getOrNull(formData, 'parent')),
      getOrNull(formData, 'grouped_products'),
      getOrNull(formData, 'upsells'),
      getOrNull(formData, 'cross_sells'),
      getOrNull(formData, 'external_url'),
      getOrNull(formData, 'button_text'),
      toNumberOrNull(getOrNull(formData, 'position')),
      getOrNull(formData, 'brands'),
      getOrNull(formData, 'attribute_1_name'),
      getOrNull(formData, 'attribute_1_values'),
      toBooleanInt(getOrNull(formData, 'attribute_1_visible')),
      toBooleanInt(getOrNull(formData, 'attribute_1_global')),
      getOrNull(formData, 'attribute_2_name'),
      getOrNull(formData, 'attribute_2_values'),
      toBooleanInt(getOrNull(formData, 'attribute_2_visible')),
      toBooleanInt(getOrNull(formData, 'attribute_2_global')),
      getOrNull(formData, 'attribute_3_name'),
      getOrNull(formData, 'attribute_3_values'),
      toBooleanInt(getOrNull(formData, 'attribute_3_visible')),
      toBooleanInt(getOrNull(formData, 'attribute_3_global')),
    ];

    const query = `
      INSERT INTO products (
        id, type, sku, gtin, name, published, is_featured, visibility,
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
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23,
        $24, $25, $26, $27,
        $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37,
        $38, $39, $40, $41,
        $42, $43, $44, $45,
        $46, $47, $48, $49,
        $50, $51, $52, $53
      )
    `;

    await pool.query(query, values);

    return NextResponse.json({ success: true, message: 'Product added successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
