'use client';

import { useState } from 'react';
import CartProducts from './_components/cart-products';
import CartTotals from './_components/cart-totals';

export default function CartPage() {
  const [subtotal, setSubtotal] = useState(0);
  const shipping = 10.0;

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6 max-w-6xl mx-auto">
      <CartProducts onTotalChange={setSubtotal} />
      <div className="w-full md:w-1/3">
        <CartTotals subtotal={subtotal} shipping={shipping} />
      </div>
    </div>
  );
}
