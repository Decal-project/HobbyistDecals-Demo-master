import pool from '@/lib/db'

export default async function SuccessPage({ searchParams }: { searchParams: Record<string, string> }) {
  const session_id = searchParams.session_id

  if (!session_id) {
    return <p>Session ID is missing.</p>
  }

  try {
    const result = await pool.query(
      'SELECT billing_first_name, billing_last_name, total_amount FROM checkout_orders WHERE stripe_session_id = $1',
      [session_id]
    )

    if (result.rows.length === 0) {
      return <p>Order not found.</p>
    }

    const order = result.rows[0]
    const billingName = `${order.billing_first_name} ${order.billing_last_name}`
    const totalAmount = parseFloat(order.total_amount)
    const formattedTotalAmount = isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)

    return (
      <div className="max-w-2xl mx-auto p-6 text-center bg-white shadow rounded mt-10">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Congratulations, {billingName}!</h1>
        <p className="text-lg mb-4">Thank you for your order.</p>
        <p className="text-xl font-semibold">Total Paid: ${formattedTotalAmount}</p>
        <p className="mt-6 text-gray-700">
          We’ve received your order and will process it soon.
        </p>
      </div>
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    return <p>Failed to load order details.</p>
  }
}
