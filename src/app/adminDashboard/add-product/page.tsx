'use client';
import { SidebarIcon } from 'lucide-react';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

const categoriesList = [
  "War Games Decals | Custom & Tactical Designs for WarGaming (14)",
  "Truck Decals for Scale Models (121)",
  "Trailer Decals | Custom Vinyl & Professional Designs (11)",
  "Speed Car Decals for Model Enthusiasts (31)",
  "PinStriping Decals for Classic & Custom Designs (22)",
  "Model Railway & Train Decals for Enthusiasts (74)",
  "Military Decals (1)",
  "Midget Car Decals & Stripes (28)",
  "Logo & Symbol Decals for Every Occasion (23)",
  "LocoMotive Decals for Model RailRoads | Ho Scale & Custom Designs (2)",
  "License Plate Decals | Custom & Personalized Designs (7)",
  "Letters & Numbers Decals (4)",
  "Graffiti Decals for Ho Scale Models (2)",
  "German WWII Decals for Accurate Historical Models (24)",
  "Car Decals for Every Enthusiast",
  "Boat & Ship Decals for Scale Models | Custom Marine Graphics (21)",
  "Bike Decals for Scale Models (2)",
  "Armor Decals for Model Enthusiast (80)",
  "Aircraft Decals for Scale Model (66)",
  "Others (18)",
];

const visibilityOptions = ['visible', 'catalog', 'hidden'];
const taxStatusOptions = ['taxable', 'shipping', 'none'];

export default function AddProduct() {
  const [formData, setFormData] = useState({
    id: '',
    type: 'simple',
    sku: '',
    gtin: '',
    name: '',
    published: false,
    is_featured: false,
    visibility: 'visible',
    short_description: '',
    description: '',
    date_sale_price_starts: '',
    date_sale_price_ends: '',
    tax_status: 'taxable',
    tax_class: '',
    in_stock: true,
    stock: 0,
    low_stock_amount: '',
    backorders_allowed: false,
    sold_individually: false,
    weight_g: '',
    length_mm: '',
    width_mm: '',
    height_mm: '',
    allow_customer_reviews: true,
    purchase_note: '',
    sale_price: '',
    regular_price: '',
    categories: '',
    tags: '',
    shipping_class: '',
    download_limit: '',
    download_expiry_days: '',
    parent: '',
    grouped_products: '',
    upsells: '',
    cross_sells: '',
    external_url: '',
    button_text: '',
    position: '',
    brands: '',
    attribute_1_name: 'media',
    attribute_1_values: '',
    attribute_1_visible: false,
    attribute_1_global: false,
    attribute_2_name: 'scale',
    attribute_2_values: '',
    attribute_2_visible: false,
    attribute_2_global: false,
    attribute_3_name: '',
    attribute_3_values: '',
    attribute_3_visible: false,
    attribute_3_global: false,
  });

  const [images, setImages] = useState<FileList | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (target instanceof HTMLInputElement && target.type === 'file') {
      setImages(target.files);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: target.value,
      }));
    }
  };

  const handleCategoryClick = (title: string) => {
    setFormData(prev => ({
      ...prev,
      categories: title,
    }));
  };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.id.trim()) {
      alert('ID is required');
      return;
    }
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (formData.in_stock && (formData.stock === null || Number(formData.stock) < 0)) {
      alert('Stock must be 0 or greater');
      return;
    }

    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
            formPayload.append(key, value ? '1' : '0');
        } else {
            formPayload.append(key, String(value));
        }
    });

    if (images) {
      Array.from(images).forEach((file) => {
        formPayload.append('images', file);
      });
    }

    try {
      const res = await fetch('/api/addProduct', {
        method: 'POST',
        body: formPayload,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        alert(data.message || 'Product added successfully');
      } else {
        alert(data.error || 'Error adding product');
      }
    } catch (error) {
      alert('Network error: Could not reach the server');
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 text-purple-100 p-6 flex flex-col">
        <div className="mb-8 flex items-center space-x-3">
          <SidebarIcon className="w-6 h-6 text-purple-300" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-3 text-sm">
          <Link href="/adminDashboard/add-product" className="block px-3 py-2 rounded hover:bg-purple-700 transition">
            ➕ Add Products
          </Link>
          <Link href="/adminDashboard/add-product/edit" className="block px-3 py-2 rounded bg-purple-700">
            🛠️ Edit and Delete Product
          </Link>
          <Link href="/adminDashboard/add-product/list" className="block px-3 py-2 rounded hover:bg-purple-700 transition">
            📋 List of Products
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-purple-900">Add Product</h1>

        {/* Category picker */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-purple-900">Choose Category</label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto rounded border border-purple-400 bg-white p-3 text-purple-900">
            {categoriesList.map((title, index) => (
              <button
                key={index}
                type="button"
                className={`text-left p-2 rounded border ${
                  formData.categories === title
                    ? 'border-purple-800 bg-purple-100 font-semibold'
                    : 'border-transparent hover:border-purple-400 hover:bg-purple-50'
                }`}
                onClick={() => handleCategoryClick(title)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Product form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 max-w-4xl bg-white rounded p-6 shadow"
          encType="multipart/form-data"
        >
          {/* Text inputs */}
          {[
            { label: 'ID', name: 'id', type: 'text', required: true },
            { label: 'Type', name: 'type', type: 'text' },
            { label: 'SKU', name: 'sku', type: 'text' },
            { label: 'GTIN', name: 'gtin', type: 'text' },
            { label: 'Name', name: 'name', type: 'text', required: true },
            { label: 'Short Description', name: 'short_description', type: 'textarea' },
            { label: 'Description', name: 'description', type: 'textarea' },
            { label: 'Date Sale Price Starts', name: 'date_sale_price_starts', type: 'date' },
            { label: 'Date Sale Price Ends', name: 'date_sale_price_ends', type: 'date' },
            { label: 'Tax Class', name: 'tax_class', type: 'text' },
            { label: 'Low Stock Amount', name: 'low_stock_amount', type: 'number' },
            { label: 'Weight (g)', name: 'weight_g', type: 'number' },
            { label: 'Length (mm)', name: 'length_mm', type: 'number' },
            { label: 'Width (mm)', name: 'width_mm', type: 'number' },
            { label: 'Height (mm)', name: 'height_mm', type: 'number' },
            { label: 'Purchase Note', name: 'purchase_note', type: 'textarea' },
            { label: 'Sale Price', name: 'sale_price', type: 'number', step: "0.01" },
            { label: 'Regular Price', name: 'regular_price', type: 'number', step: "0.01" },
            { label: 'Tags', name: 'tags', type: 'text' },
            { label: 'Shipping Class', name: 'shipping_class', type: 'text' },
            { label: 'Download Limit', name: 'download_limit', type: 'number' },
            { label: 'Download Expiry Days', name: 'download_expiry_days', type: 'number' },
            { label: 'Parent', name: 'parent', type: 'text' },
            { label: 'Grouped Products', name: 'grouped_products', type: 'text' },
            { label: 'Upsells', name: 'upsells', type: 'text' },
            { label: 'Cross Sells', name: 'cross_sells', type: 'text' },
            { label: 'External URL', name: 'external_url', type: 'text' },
            { label: 'Button Text', name: 'button_text', type: 'text' },
            { label: 'Position', name: 'position', type: 'number' },
            { label: 'Brands', name: 'brands', type: 'text' },
            { label: 'Attribute 1 Name', name: 'attribute_1_name', type: 'text' },
            { label: 'Attribute 1 Values', name: 'attribute_1_values', type: 'text' },
            { label: 'Attribute 2 Name', name: 'attribute_2_name', type: 'text' },
            { label: 'Attribute 2 Values', name: 'attribute_2_values', type: 'text' },
            { label: 'Attribute 3 Name', name: 'attribute_3_name', type: 'text' },
            { label: 'Attribute 3 Values', name: 'attribute_3_values', type: 'text' },
          ].map(({ label, name, type, required }) =>
            type === 'textarea' ? (
              <div key={name} className="flex flex-col">
                <label htmlFor={name} className="mb-1 font-semibold text-purple-900">{label}</label>
                <textarea
                  id={name}
                  name={name}
                  value={formData[name as keyof typeof formData] as string}
                  onChange={handleChange}
                  className="rounded border border-purple-400 p-2 text-purple-900"
                  rows={3}
                  required={required}
                />
              </div>
            ) : (
              <div key={name} className="flex flex-col">
                <label htmlFor={name} className="mb-1 font-semibold text-purple-900">{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type === 'number' ? 'number' : type}
                  step={type === 'number' && name.includes('price') ? '0.01' : undefined}
                  // FIX: Added type assertion to satisfy the 'value' prop type
                  value={formData[name as keyof typeof formData] as string | number}
                  onChange={handleChange}
                  className="rounded border border-purple-400 p-2 text-purple-900"
                  required={required}
                />
              </div>
            )
          )}

          {/* Select inputs */}
          <div className="flex flex-col">
            <label htmlFor="visibility" className="mb-1 font-semibold text-purple-900">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="rounded border border-purple-400 p-2 text-purple-900"
            >
              {visibilityOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tax_status" className="mb-1 font-semibold text-purple-900">Tax Status</label>
            <select
              id="tax_status"
              name="tax_status"
              value={formData.tax_status}
              onChange={handleChange}
              className="rounded border border-purple-400 p-2 text-purple-900"
            >
              {taxStatusOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Boolean checkboxes */}
          {[
            { label: 'Published', name: 'published' },
            { label: 'Is Featured', name: 'is_featured' },
            { label: 'In Stock', name: 'in_stock' },
            { label: 'Backorders Allowed', name: 'backorders_allowed' },
            { label: 'Sold Individually', name: 'sold_individually' },
            { label: 'Allow Customer Reviews', name: 'allow_customer_reviews' },
            { label: 'Attribute 1 Visible', name: 'attribute_1_visible' },
            { label: 'Attribute 1 Global', name: 'attribute_1_global' },
            { label: 'Attribute 2 Visible', name: 'attribute_2_visible' },
            { label: 'Attribute 2 Global', name: 'attribute_2_global' },
            { label: 'Attribute 3 Visible', name: 'attribute_3_visible' },
            { label: 'Attribute 3 Global', name: 'attribute_3_global' },
          ].map(({ label, name }) => (
            <div key={name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={name}
                name={name}
                checked={formData[name as keyof typeof formData] as boolean}
                onChange={handleChange}
                className="w-4 h-4 text-purple-700"
              />
              <label htmlFor={name} className="text-purple-900">{label}</label>
            </div>
          ))}

          {/* Images upload */}
          <div className="flex flex-col">
            <label htmlFor="images" className="mb-1 font-semibold text-purple-900">
              Upload Images
            </label>
            <input
              id="images"
              name="images"
              type="file"
              onChange={handleChange}
              multiple
              className="rounded border border-purple-400 p-1 text-purple-900"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 rounded bg-purple-900 text-white px-4 py-2 font-semibold hover:bg-purple-800 transition"
          >
            Add Product
          </button>
        </form>
      </main>
    </div>
  );
}
