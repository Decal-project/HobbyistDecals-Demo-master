'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Select from 'react-select'
import { useRouter } from 'next/navigation'

interface AddressFields {
  firstName: string
  lastName: string
  company: string
  country: string
  address: string
  city: string
  state: string
  pin: string
  phone: string
  email: string
}

interface CheckoutFormData {
  billing: AddressFields
  shipping: AddressFields
  notes: string
  paymentMethod: 'paypal' | 'card'
  agreed: boolean
}

const emptyAddress: AddressFields = {
  firstName: '',
  lastName: '',
  company: '',
  country: '',
  address: '',
  city: '',
  state: '',
  pin: '',
  phone: '',
  email: '',
}

interface CartItem {
  sku: string
  name: string
  price: number
  quantity: number
}

interface Cart {
  id: number
  shipping_amount: number
  created_at: string
}

export default function CheckoutForm() {
  const router = useRouter()

  // order summary
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loadingCart, setLoadingCart] = useState(true)

  // form state
  const [shipToDifferent, setShipToDifferent] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    billing: { ...emptyAddress },
    shipping: { ...emptyAddress },
    notes: '',
    paymentMethod: 'paypal',
    agreed: false,
  })

  // fetch latest cart on mount
  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json())
      .then(({ cart, items }) => {
        setCart(cart)
        setItems(items)
      })
      .catch(console.error)
      .finally(() => setLoadingCart(false))
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingAmt = cart?.shipping_amount ?? 0
  const total = subtotal + shippingAmt

  const handleChange = (
    section: 'billing' | 'shipping',
    field: keyof AddressFields,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreed: e.target.checked }))
  }

  const handleRadio = (method: 'paypal' | 'card') => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.agreed) {
      alert('Please agree to the terms.')
      return
    }
    // build your payload here… include total if needed
    alert('Order submitted!')
  }

  const renderFields = (prefix: 'billing' | 'shipping') => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <input
          required
          placeholder="First Name"
          className="p-2 border"
          value={formData[prefix].firstName}
          onChange={(e) => handleChange(prefix, 'firstName', e.target.value)}
        />
        <input
          required
          placeholder="Last Name"
          className="p-2 border"
          value={formData[prefix].lastName}
          onChange={(e) => handleChange(prefix, 'lastName', e.target.value)}
        />
      </div>
      <input
        placeholder="Company (optional)"
        className="p-2 border w-full mt-2"
        value={formData[prefix].company}
        onChange={(e) => handleChange(prefix, 'company', e.target.value)}
      />
      <input
        required
        placeholder="Country / Region"
        className="p-2 border w-full mt-2"
        value={formData[prefix].country}
        onChange={(e) => handleChange(prefix, 'country', e.target.value)}
      />
      <input
        required
        placeholder="Street Address"
        className="p-2 border w-full mt-2"
        value={formData[prefix].address}
        onChange={(e) => handleChange(prefix, 'address', e.target.value)}
      />
      <input
        required
        placeholder="Town / City"
        className="p-2 border w-full mt-2"
        value={formData[prefix].city}
        onChange={(e) => handleChange(prefix, 'city', e.target.value)}
      />
      <input
        required
        placeholder="State"
        className="p-2 border w-full mt-2"
        value={formData[prefix].state}
        onChange={(e) => handleChange(prefix, 'state', e.target.value)}
      />
      <input
        required
        placeholder="PIN Code"
        className="p-2 border w-full mt-2"
        value={formData[prefix].pin}
        onChange={(e) => handleChange(prefix, 'pin', e.target.value)}
      />
      <input
        required
        placeholder="Phone"
        className="p-2 border w-full mt-2"
        value={formData[prefix].phone}
        onChange={(e) => handleChange(prefix, 'phone', e.target.value)}
      />
      <input
        required
        placeholder="Email Address"
        type="email"
        className="p-2 border w-full mt-2"
        value={formData[prefix].email}
        onChange={(e) => handleChange(prefix, 'email', e.target.value)}
      />
    </>
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT: CHECKOUT FORM */}
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-6">
            <h2 className="text-xl font-bold">Billing Details</h2>
            {renderFields('billing')}

            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={shipToDifferent}
                onChange={() => setShipToDifferent((v) => !v)}
                className="mr-2"
              />
              Ship to a different address?
            </label>

            {shipToDifferent && (
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold">Shipping Details</h3>
                {renderFields('shipping')}
              </div>
            )}

            <textarea
              placeholder="Order Notes (optional)"
              className="p-2 border w-full mt-4"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            />

            <div className="mt-6">
              <h2 className="text-lg font-semibold">Payment</h2>
              <label className="block mt-2">
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={() => handleRadio('paypal')}
                  className="mr-2"
                />
                PayPal
              </label>
              <label className="block mt-1">
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => handleRadio('card')}
                  className="mr-2"
                />
                Debit & Credit Cards
              </label>
            </div>

            <label className="block mt-4">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={handleCheckbox}
                className="mr-2"
              />
              I agree to the {' '}
              <a href="#" className="text-blue-600 underline">terms & conditions</a>
            </label>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-blue-800 font-bold text-xl py-3 rounded"
            >
              {formData.paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Pay with Card'}
            </button>
          </form>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="w-full md:w-1/2">
          <section className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-bold mb-4">Your Order</h2>
            {loadingCart ? (
              <p>Loading…</p>
            ) : items.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              <>
                <div className="divide-y">
                  {items.map((it, i) => (
                    <div key={i} className="flex justify-between py-2 text-gray-700">
                      <span>{it.name} × {it.quantity}</span>
                      <span>${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold pt-4">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Shipping</span>
                  <span>${shippingAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-4 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
