'use client'

import { useEffect, useState } from 'react'

export default function SuccessPage() {
  const [billingName, setBillingName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const session_id = params.get('session_id')

    if (!session_id) {
      setError('Session ID is missing.')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/order-details?session_id=${session_id}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          const { billing_first_name, billing_last_name, total_amount } = data
          setBillingName(`${billing_first_name} ${billing_last_name}`)
          setTotalAmount(parseFloat(total_amount).toFixed(2))
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch order details.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-6 text-center bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Congratulations, {billingName}!</h1>
      <p className="text-lg mb-4">Thank you for your order.</p>
      <p className="text-xl font-semibold">Total Paid: ${totalAmount}</p>
      <p className="mt-6 text-gray-700">
        We’ve received your order and will process it soon.
      </p>
    </div>
  )
}
