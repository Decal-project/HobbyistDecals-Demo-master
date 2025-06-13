'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYou() {
  const searchParams = useSearchParams();

  const params = searchParams ?? new URLSearchParams();
  const name = params.get('name') ?? 'Customer';
  const amount = params.get('amount') ?? '';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-600">Thank You, {name}!</h1>
        <p className="text-lg mb-6">
          Your payment of <strong>${amount}</strong> was successful.
        </p>
        <p className="mb-6">
          We will process your order and send you a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="inline-block bg-yellow-400 text-blue-800 font-semibold py-3 px-6 rounded hover:bg-yellow-500 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
