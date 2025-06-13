// app/_components/cart-products.tsx
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
            try {
                const parsed = JSON.parse(storedCart) as Partial<CartItem>[];
                const items: CartItem[] = parsed.map((item) => ({
                    name: item.name ?? '',
                    price: Number(item.price ?? 0),
                    media: item.media ?? '',
                    scale: item.scale ?? '',
                    variation: item.variation ?? '',
                    quantity: Number(item.quantity ?? 1),
                    sku: item.sku ?? '',
                    image: item.image ?? '',
                }));
                setCartItems(items);
                const total = calculateFinalTotal(items);
                onTotalChange(total);
            } catch (err) {
                console.error('Failed to parse cart:', err);
            }
        }
    }, []);

    // New useEffect to save cart on changes
    useEffect(() => {
        const saveCartToDB = async () => {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                try {
                    const cartItemsToSave = JSON.parse(storedCart);
                    const res = await fetch('/api/cart/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cartItems: cartItemsToSave,
                            shippingAmount: null, // We might not have shipping yet
                            discountAmount: null, // We might not have discount yet
                        }),
                    });

                    if (!res.ok) {
                        console.error('Failed to auto-save cart.');
                    } else {
                        console.log('Cart auto-saved.');
                    }
                } catch (error) {
                    console.error('Error auto-saving cart:', error);
                }
            }
        };

        // Save cart whenever cartItems in localStorage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'cart') {
                saveCartToDB();
            }
        });

        // Save cart on initial load (in case localStorage was already populated)
        saveCartToDB();

        // Cleanup the event listener
        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'cart') {
                    saveCartToDB();
                }
            });
        };
    }, []);

    const getDiscountRate = (quantity: number): number => {
        if (quantity >= 7) return 0.3;
        if (quantity >= 5) return 0.2;
        if (quantity >= 3) return 0.1;
        return 0;
    };

    const getItemSubtotal = (item: CartItem): number => {
        const rate = getDiscountRate(item.quantity);
        const totalPrice = item.price * item.quantity;
        const discountedTotal = totalPrice * (1 - rate);
        return discountedTotal;
    };

    const calculateFinalTotal = (items: CartItem[]) => {
        return items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        const updatedItems = [...cartItems];
        updatedItems[index].quantity = newQuantity;
        setCartItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        const total = calculateFinalTotal(updatedItems);
        onTotalChange(total);
    };

    const handleRemove = (index: number) => {
        const updatedItems = [...cartItems];
        updatedItems.splice(index, 1);
        setCartItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        const total = calculateFinalTotal(updatedItems);
        onTotalChange(total);
    };

    return (
        <div className="w-full md:w-2/3 p-4">
            <h1 className="text-2xl font-bold mb-4">Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    {cartItems.map((item, index) => {
                        const discountedTotal = getItemSubtotal(item);

                        return (
                            <div key={index} className="flex items-center justify-between border p-4 mb-4">
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="text-red-500 text-xl font-bold mr-4"
                                >
                                    ×
                                </button>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-contain mr-4"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.scale}, {item.variation}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Price: ${item.price.toFixed(2)}
                                    </p>
                                    {getDiscountRate(item.quantity) > 0 && (
                                        <p className="text-xs text-green-600">
                                            Discount applied: {Math.round(getDiscountRate(item.quantity) * 100)}%
                                        </p>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    className="w-16 border ml-4 text-center"
                                    value={item.quantity}
                                    min="1"
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                />
                                <div className="text-right ml-4 w-32">
                                    <p className="font-semibold">
                                        ${discountedTotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-4">
                        <p className="font-semibold">
                            Subtotal: ${cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0).toFixed(2)}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
