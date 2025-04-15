"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
}

interface FormData {
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
  stock: string;
}

export default function AddProductPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    brand: "",
    price: "",
    category: "",
    description: "",
    imageUrl: "",
    stock: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    const res = await fetch("/api/addProducts");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/addProducts/${editingId}` : "/api/addProducts";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        name: "",
        brand: "",
        price: "",
        category: "",
        description: "",
        imageUrl: "",
        stock: "",
      });
      setEditingId(null);
      fetchProducts();
    } else {
      alert("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      stock: product.stock.toString(),
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/manage-products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Product Manager</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-10">
        {Object.entries(form).map(([key, val]) => (
          <input
            key={key}
            type={key === "price" || key === "stock" ? "number" : "text"}
            placeholder={key}
            value={val}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="p-2 border rounded"
          />
        ))}
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Product List</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Price</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod: Product) => (
            <tr key={prod.id} className="border-t">
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.brand}</td>
              <td className="p-2">₹{prod.price}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(prod)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(prod.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
