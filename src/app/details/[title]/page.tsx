"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Product = {
  regular_price: string;
  images: string[];
  attribute_1_values: string;
  attribute_2_values: string;
  attribute_3_name: string;
  attribute_3_values: string;
  description: string;
  name: string;
  sku_images: Record<string, string>;
};

const ProductDetailPage = () => {
  const { title } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMedia, setSelectedMedia] = useState("");
  const [selectedScale, setSelectedScale] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [skuImage, setSkuImage] = useState<string | null>(null);

  useEffect(() => {
    if (!title) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/details?name=${title}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [title]);

  const mediaOptions = product?.attribute_1_values?.split(",").map((item) => item.trim()) || [];
  const scaleOptions = product?.attribute_2_values?.split(",").map((item) => item.trim()) || [];
  const variationOptions = product?.attribute_3_values
  ?.split(",")
  .map((item) => item.trim().split(":")[0].toUpperCase()) || [];
  const generateSKU = () => {
    if (!product || !product.images || product.images.length === 0) return "SKU not found";

    const baseMatch = product.images[0].match(/(HD\d{6})/);
    if (!baseMatch) return "SKU not found";

    const baseSKU = baseMatch[1];

    let mediaPrefix = "";
    if (selectedMedia.toLowerCase() === "waterslide") {
      mediaPrefix = "WD";
    } else if (selectedMedia) {
      mediaPrefix = selectedMedia.toUpperCase().slice(0, 2);
    }

    let scalePart = "";
    const scaleMatch = selectedScale.match(/1\/(\d+)/);
    if (scaleMatch) {
      scalePart = `S${scaleMatch[1].padStart(3, "0")}`;
    }

    const variationPart = selectedVariation ? `-${selectedVariation.toUpperCase()}` : "";

    return `${mediaPrefix}-${baseSKU}${scalePart ? `-${scalePart}` : ""}${variationPart}`;
  };

  // Lookup image based on SKU from product.sku_images
  useEffect(() => {
    if (!product) return;
 
    const sku = generateSKU();
    if (!sku || sku === "SKU not found") {
      setSkuImage(null);
      return;
    }

    const image = product.sku_images?.[sku];
    setSkuImage(image || null);
  }, [selectedMedia, selectedScale, selectedVariation, product]);

  const fallbackImage = product?.images[0] || "/placeholder.jpg";

  if (loading) return <div className="p-6 text-lg">Loading product...</div>;
  if (!product) return <div className="p-6 text-red-500">Product not found.</div>;

  return (
    <div className="p-6 flex flex-col md:flex-row gap-10">
      {/* Image container */}
      <div className="border border-blue-500 rounded-lg overflow-hidden">
        <Image
          key={`${selectedMedia}-${selectedScale}-${selectedVariation}`}
          src={skuImage || fallbackImage}
          alt={product.name}
          width={500}
          height={500}
          className="object-contain"
          priority
        />
      </div>

      {/* Product Info */}
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
        <p className="text-xl text-blue-600 font-bold mb-4">${product.regular_price}</p>

        <div className="space-y-4 mb-6">
          {/* Media Dropdown */}
          <div>
            <label className="block font-medium mb-1">Media</label>
            <select
              value={selectedMedia}
              onChange={(e) => setSelectedMedia(e.target.value)}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">Choose an option</option>
              {mediaOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Dropdown */}
          <div>
            <label className="block font-medium mb-1">Scale</label>
            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">Choose an option</option>
              {scaleOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Variation/Colour Dropdown */}
          {product.attribute_3_name && (
            <div>
              <label className="block font-medium mb-1">{product.attribute_3_name}</label>
              <select
                value={selectedVariation}
                onChange={(e) => setSelectedVariation(e.target.value)}
                className="w-full border rounded px-4 py-2"
              >
                <option value="">Choose an option</option>
                {variationOptions.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block font-medium mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded px-4 py-2"
            />
          </div>
        </div>

        {/* Offers */}
        <div className="text-sm text-gray-600 mb-4">
          <p>3 - 4 Qty: 10% Off</p>
          <p>5 - 6 Qty: 20% Off</p>
          <p>7 or more Qty: 30% Off</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
          
          <button
  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
  onClick={() => {
    console.log("Add to Cart clicked"); 
    if (!selectedMedia || !selectedScale || !quantity) {
      alert("Please select all options and quantity.");
      return;
    }

    const newCartItem = {
      name: product.name,
      price: product.regular_price,
      media: selectedMedia,
      scale: selectedScale,
      variation: selectedVariation,
      quantity,
      sku: generateSKU(),
      image: skuImage || fallbackImage,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    existingCart.push(newCartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert("Item added to cart!");
  }}
>
  Add to Cart
</button>

        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* SKU Display */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-1">SKU</h3>
          <p className="text-gray-700">{generateSKU()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

