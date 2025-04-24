'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';

type ProductPayload = {
  id?: number;   
  type: string;
  sku: string;
  gtin: string;
  name: string;
  visibility: string;
  short_description: string;
  description: string;
  date_sale_price_starts: string;
  date_sale_price_ends: string;
  tax_status: string;
  tax_class: string;
  stock: number;
  low_stock_amount: number;
  weight_g: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  purchase_note: string;
  regular_price: string;
  sale_price: string;
  shipping_class: string;
  external_url: string;
  button_text: string;
  position: number;
  category: string;
  brand: string;
  images: File[];
};

const DEFAULT: ProductPayload = {
  type: '',
  sku: '',
  gtin: '',
  name: '',
  visibility: '',
  short_description: '',
  description: '',
  date_sale_price_starts: '',
  date_sale_price_ends: '',
  tax_status: '',
  tax_class: '',
  stock: 0,
  low_stock_amount: 0,
  weight_g: 0,
  length_mm: 0,
  width_mm: 0,
  height_mm: 0,
  purchase_note: '',
  regular_price: '',
  sale_price: '',
  shipping_class: '',
  external_url: '',
  button_text: '',
  position: 0,
  category: '',
  brand: '',
  images: [],
};

export default function ProductForm() {
  const [product, setProduct] = useState<ProductPayload>(DEFAULT);
  const [error, setError] = useState<string>('');
  const [products, setProducts] = useState<ProductPayload[]>([]);

  // ✅ Fetch products from the same route
  async function fetchProducts() {
    try {
      const res = await fetch('/api/addProduct', {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  useEffect(() => {
    fetchProducts(); // Initial fetch
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;
    setProduct(prev => ({
      ...prev,
      images: Array.from(files),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!product.name.trim() || !product.sku.trim()) {
      setError('❗ Name and SKU are required.');
      return;
    }

    const formData = new FormData();
    Object.entries(product).forEach(([key, val]) => {
      if (key === 'images') {
        (val as File[]).forEach(file => formData.append('images', file));
      } else {
        formData.append(key, String(val));
      }
    });

    try {
      const res = await fetch('/api/addProduct', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setError('❗ Submission failed.');
      } else {
        alert('✅ Product submitted!');
        setProduct(DEFAULT);
        fetchProducts(); // Refresh product list
      }
    } catch (err) {
      setError('❗ Submission error.');
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow rounded space-y-6 overflow-auto h-screen">
        <h2 className="text-xl font-bold">Basic Info</h2>
        <label>
          Product Type:
          <input
            name="type"
            type="text"
            placeholder="e.g. Electronics, Apparel"
            value={product.type}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Product Name:
          <input
            name="name"
            type="text"
            placeholder="e.g. Blue T-shirt"
            value={product.name}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          SKU:
          <input
            name="sku"
            type="text"
            placeholder="e.g. BT-001"
            value={product.sku}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          GTIN:
          <input
            name="gtin"
            type="text"
            placeholder="e.g. 012345678905"
            value={product.gtin}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Visibility:
          <input
            name="visibility"
            type="text"
            placeholder="e.g. public, private"
            value={product.visibility}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Short Description:
          <textarea
            name="short_description"
            placeholder="One-line summary"
            value={product.short_description}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            placeholder="Detailed description"
            value={product.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <h2 className="text-xl font-bold">Pricing</h2>
        <label>
          Regular Price:
          <input
            name="regular_price"
            type="text"
            placeholder="e.g. 29.99"
            value={product.regular_price}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Sale Price:
          <input
            name="sale_price"
            type="text"
            placeholder="e.g. 19.99"
            value={product.sale_price}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Sale Start Date:
          <input
            name="date_sale_price_starts"
            type="date"
            value={product.date_sale_price_starts}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Sale End Date:
          <input
            name="date_sale_price_ends"
            type="date"
            value={product.date_sale_price_ends}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <h2 className="text-xl font-bold">Inventory</h2>
        <label>
          Stock Quantity:
          <input
            name="stock"
            type="number"
            placeholder="e.g. 100"
            value={product.stock || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Low Stock Threshold:
          <input
            name="low_stock_amount"
            type="number"
            placeholder="e.g. 10"
            value={product.low_stock_amount || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <h2 className="text-xl font-bold">Shipping & Dimensions</h2>
        <label>
          Weight (g):
          <input
            name="weight_g"
            type="number"
            placeholder="e.g. 200"
            value={product.weight_g || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Length (mm):
          <input
            name="length_mm"
            type="number"
            placeholder="e.g. 500"
            value={product.length_mm || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Width (mm):
          <input
            name="width_mm"
            type="number"
            placeholder="e.g. 300"
            value={product.width_mm || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Height (mm):
          <input
            name="height_mm"
            type="number"
            placeholder="e.g. 50"
            value={product.height_mm || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <h2 className="text-xl font-bold">Extras</h2>
        <label>
          Purchase Note:
          <input
            name="purchase_note"
            type="text"
            placeholder="e.g. Thank you for your purchase!"
            value={product.purchase_note}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label>
          Images:
          <input
            name="images"
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Submit Product
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </form>

       {/* Product Listing as Cards */}
    <h2 className="text-2xl font-bold mt-10 text-center">Product List</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-4">
      {products.map((product) => (
        <div
          key={product.id}                         // ← use id here
          className="border rounded shadow-md p-4 bg-white flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
            <p className="text-sm mb-4">Price: ₹{product.regular_price}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-yellow-500 text-white px-4 py-1 rounded w-full">
              Edit
            </button>
            <button className="bg-red-500 text-white px-4 py-1 rounded w-full">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}
