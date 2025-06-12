'use client'

import { useEffect, useState } from 'react'

interface ThankYouData {
  billingName: string
  totalAmount: number
}

export default function SuccessPage({ searchParams }: { searchParams: { session_id: string } }) {
  const { session_id } = searchParams
  const [data, setData] = useState<ThankYouData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session_id) {
      setError('Session ID is missing.')
      return
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/get-order?session_id=${session_id}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const order = await res.json()

        setData({
          billingName: `${order.billing_first_name} ${order.billing_last_name}`,
          totalAmount: parseFloat(order.total_amount),
        })

        // Trigger confirmation email
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripe_session_id: session_id }),
        })
      } catch (err) {
        console.error(err)
        setError('Failed to load order details.')
      }
    }

    fetchOrder()
  }, [session_id])

  if (error) return <p>{error}</p>
  if (!data) return <p>Loading order...</p>

  const { billingName, totalAmount } = data
  const formattedTotal = isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)

  return (
    <div className="max-w-2xl mx-auto p-6 text-center bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Congratulations, {billingName}!</h1>
      <p className="text-lg mb-4">Thank you for your order.</p>
      <p className="text-xl font-semibold">Total Paid: ${formattedTotal}</p>
      <p className="mt-6 text-gray-700">
        We’ve received your order and will process it soon.
      </p>
    </div>
  )
}
