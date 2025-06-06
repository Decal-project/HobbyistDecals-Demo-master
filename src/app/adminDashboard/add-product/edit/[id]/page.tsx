'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: number;
  type: string;
  sku: string;
  gtin: string;
  name: string;
  published: boolean;
  is_featured: boolean;
  visibility: string;
  short_description: string;
  description: string;
  date_sale_price_starts: string;
  date_sale_price_ends: string;
  tax_status: string;
  tax_class: string;
  in_stock: boolean;
  stock: number;
  low_stock_amount: number;
  backorders_allowed: boolean;
  sold_individually: boolean;
  weight_g: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  allow_customer_reviews: boolean;
  purchase_note: string;
  sale_price: number;
  regular_price: number;
  categories: string;
  tags: string;
  shipping_class: string;
  images: string;
  download_limit: number;
  download_expiry_days: number;
  parent: number;
  grouped_products: string;
  upsells: string;
  cross_sells: string;
  external_url: string;
  button_text: string;
  position: number;
  brands: string;
  attribute_1_name: string;
  attribute_1_values: string;
  attribute_1_visible: boolean;
  attribute_1_global: boolean;
  attribute_2_name: string;
  attribute_2_values: string;
  attribute_2_visible: boolean;
  attribute_2_global: boolean;
  attribute_3_name: string;
  attribute_3_values: string;
  attribute_3_visible: boolean;
  attribute_3_global: boolean;
}

export default function EditProduct() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/addProduct/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  const booleanFields = new Set([
    'published',
    'is_featured',
    'in_stock',
    'backorders_allowed',
    'sold_individually',
    'allow_customer_reviews',
    'attribute_1_visible',
    'attribute_1_global',
    'attribute_2_visible',
    'attribute_2_global',
    'attribute_3_visible',
    'attribute_3_global',
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setProduct((prev) => ({
      ...prev!,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/addProduct/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to update product');
      alert('Product updated successfully!');
      router.push('/adminDashboard/add-product/list');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Unknown error occurred while updating product');
      }
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'type', label: 'Type' },
    { name: 'sku', label: 'SKU' },
    { name: 'gtin', label: 'GTIN' },
    { name: 'name', label: 'Name' },
    { name: 'published', label: 'Published' },
    { name: 'is_featured', label: 'Is Featured' },
    { name: 'visibility', label: 'Visibility' },
    { name: 'short_description', label: 'Short Description' },
    { name: 'description', label: 'Description' },
    { name: 'date_sale_price_starts', label: 'Sale Price Start Date' },
    { name: 'date_sale_price_ends', label: 'Sale Price End Date' },
    { name: 'tax_status', label: 'Tax Status' },
    { name: 'tax_class', label: 'Tax Class' },
    { name: 'in_stock', label: 'In Stock' },
    { name: 'stock', label: 'Stock' },
    { name: 'low_stock_amount', label: 'Low Stock Amount' },
    { name: 'backorders_allowed', label: 'Backorders Allowed' },
    { name: 'sold_individually', label: 'Sold Individually' },
    { name: 'weight_g', label: 'Weight (g)' },
    { name: 'length_mm', label: 'Length (mm)' },
    { name: 'width_mm', label: 'Width (mm)' },
    { name: 'height_mm', label: 'Height (mm)' },
    { name: 'allow_customer_reviews', label: 'Allow Customer Reviews' },
    { name: 'purchase_note', label: 'Purchase Note' },
    { name: 'sale_price', label: 'Sale Price' },
    { name: 'regular_price', label: 'Regular Price' },
    { name: 'categories', label: 'Categories' },
    { name: 'tags', label: 'Tags' },
    { name: 'shipping_class', label: 'Shipping Class' },
    { name: 'images', label: 'Images (Comma Separated URLs)' },
    { name: 'download_limit', label: 'Download Limit' },
    { name: 'download_expiry_days', label: 'Download Expiry Days' },
    { name: 'parent', label: 'Parent Product ID' },
    { name: 'grouped_products', label: 'Grouped Products (IDs)' },
    { name: 'upsells', label: 'Upsell Product IDs' },
    { name: 'cross_sells', label: 'Cross-sell Product IDs' },
    { name: 'external_url', label: 'External URL' },
    { name: 'button_text', label: 'Button Text' },
    { name: 'position', label: 'Position' },
    { name: 'brands', label: 'Brands' },
    { name: 'attribute_1_name', label: 'Attribute 1 Name' },
    { name: 'attribute_1_values', label: 'Attribute 1 Values (Comma Separated)' },
    { name: 'attribute_1_visible', label: 'Attribute 1 Visible' },
    { name: 'attribute_1_global', label: 'Attribute 1 Global' },
    { name: 'attribute_2_name', label: 'Attribute 2 Name' },
    { name: 'attribute_2_values', label: 'Attribute 2 Values (Comma Separated)' },
    { name: 'attribute_2_visible', label: 'Attribute 2 Visible' },
    { name: 'attribute_2_global', label: 'Attribute 2 Global' },
    { name: 'attribute_3_name', label: 'Attribute 3 Name' },
    { name: 'attribute_3_values', label: 'Attribute 3 Values (Comma Separated)' },
    { name: 'attribute_3_visible', label: 'Attribute 3 Visible' },
    { name: 'attribute_3_global', label: 'Attribute 3 Global' },
  ];

  if (loading) return <p className="p-6">Loading product...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => {
          const isBoolean = booleanFields.has(field.name);
          const inputType =
            isBoolean
              ? 'checkbox'
              : field.name.includes('price') ||
                field.name === 'stock' ||
                field.name === 'low_stock_amount' ||
                field.name === 'weight_g' ||
                field.name === 'length_mm' ||
                field.name === 'width_mm' ||
                field.name === 'height_mm' ||
                field.name === 'download_limit' ||
                field.name === 'download_expiry_days' ||
                field.name === 'position'
              ? 'number'
              : field.name.includes('date')
              ? 'date'
              : field.name.includes('url')
              ? 'url'
              : 'text';

          return (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              {isBoolean ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={product[field.name as keyof Product] as boolean}
                  onChange={handleChange}
                  className="mt-1"
                />
              ) : (
                <input
                  type={inputType}
                  name={field.name}
                  value={
                    product[field.name as keyof Product] !== undefined &&
                    product[field.name as keyof Product] !== null
                      ? String(product[field.name as keyof Product])
                      : ''
                  }
                  onChange={handleChange}
                  className="mt-1 block w-full border px-3 py-2 rounded"
                />
              )}
            </div>
          );
        })}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
