'use client';
import React, { useEffect, useState } from 'react';

interface CartItem {
  name: string;
  price: number;
  media: string;
  scale: string;
  variation: string;
  quantity: number;
  sku: string;
  image: string;
}

interface Props {
  onTotalChange: (total: number) => void;
}

export default function CartProducts({ onTotalChange }: Props) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const items = JSON.parse(storedCart);
      setCartItems(items);
      const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      onTotalChange(total);
    }
  }, []);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    onTotalChange(updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  };

  const handleRemove = (index: number) => {
    const updatedItems = [...cartItems];
    updatedItems.splice(index, 1);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    onTotalChange(updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  };

  const subtotal = (item: CartItem) => item.price * item.quantity;

  return (
    <div className="w-full md:w-2/3 p-4">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border p-4 mb-4">
              <button
                onClick={() => handleRemove(index)}
                className="text-red-500 text-xl font-bold mr-4"
              >
                ×
              </button>
              <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mr-4" />
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.scale}, {item.variation}
                </p>
              </div>
              <p className="w-20 text-right">${item.price}</p>
              <input
                type="number"
                className="w-16 border ml-4 text-center"
                value={item.quantity}
                min="1"
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
              />
              <p className="w-20 text-right font-semibold ml-4">${subtotal(item)}</p>
            </div>
          ))}

          <div className="mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              className="border px-2 py-1 w-64"
            />
            <button className="border px-4 py-1 bg-gray-100 hover:bg-gray-200">Apply coupon</button>
          </div>
        </>
      )}
    </div>
  );
}
