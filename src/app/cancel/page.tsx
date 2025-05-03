// app/payment-failed/page.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white shadow rounded p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-700 mb-6">
          Your payment was unsuccessful or was canceled. Please try again or choose a different payment method.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
