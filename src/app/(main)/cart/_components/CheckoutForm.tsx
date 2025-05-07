'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface AddressFields {
  firstName: string
  lastName: string
  company: string
  country: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  email: string
}

interface CheckoutFormData {
  billing: AddressFields
  shipping: AddressFields
  shipToDifferent: boolean
  orderNotes: string
  paymentMethod: 'stripe' | 'cod'
  agreed: boolean
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
  discount_amount: number
}

export default function CheckoutForm() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loadingCart, setLoadingCart] = useState(true)

  const emptyAddr: AddressFields = {
    firstName: '',
    lastName: '',
    company: '',
    country: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  }

  const [formData, setFormData] = useState<CheckoutFormData>({
    billing: { ...emptyAddr },
    shipping: { ...emptyAddr },
    shipToDifferent: false,
    orderNotes: '',
    paymentMethod: 'stripe',
    agreed: false,
  })

  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        setCart(data.cart)
        setItems(data.items)
      })
      .catch(console.error)
      .finally(() => setLoadingCart(false))
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingAmt = cart?.shipping_amount ?? 0
  const discountAmt = cart?.discount_amount ?? 0
  const total = subtotal + shippingAmt - discountAmt

  const handleField = (
    section: 'billing' | 'shipping',
    key: keyof AddressFields,
    val: string
  ) => {
    setFormData(f => ({
      ...f,
      [section]: {
        ...f[section],
        [key]: val,
      },
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.agreed) {
      alert('Please agree to the terms.')
      return
    }

    const payload = {
      billing_first_name: formData.billing.firstName,
      billing_last_name: formData.billing.lastName,
      billing_company_name: formData.billing.company,
      billing_country: formData.billing.country,
      billing_street_address: formData.billing.address,
      billing_city: formData.billing.city,
      billing_state: formData.billing.state,
      billing_postal_code: formData.billing.postalCode,
      billing_phone: formData.billing.phone,
      billing_email: formData.billing.email,

      ship_to_different_address: formData.shipToDifferent,
      shipping_first_name: formData.shipping.firstName,
      shipping_last_name: formData.shipping.lastName,
      shipping_company_name: formData.shipping.company,
      shipping_country: formData.shipping.country,
      shipping_street_address: formData.shipping.address,
      shipping_city: formData.shipping.city,
      shipping_state: formData.shipping.state,
      shipping_postal_code: formData.shipping.postalCode,
      shipping_phone: formData.shipping.phone,
      shipping_email: formData.shipping.email,

      order_notes: formData.orderNotes,
      payment_method: formData.paymentMethod,
      total_amount: total,
      cart_id: cart?.id,
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Checkout failed')

      if (formData.paymentMethod === 'stripe' && json.url) {
        window.location.href = json.url
      } else {
        router.push('/thank-you')
      }
    } catch (err) {
      console.error('Checkout error', err)
      alert((err as Error).message)
    }
  }

  const renderFields = (section: 'billing' | 'shipping') => {
    const data = formData[section]
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="First Name"
            value={data.firstName}
            onChange={e => handleField(section, 'firstName', e.target.value)}
            className="p-2 border"
          />
          <input
            required
            placeholder="Last Name"
            value={data.lastName}
            onChange={e => handleField(section, 'lastName', e.target.value)}
            className="p-2 border"
          />
        </div>
        <input
          placeholder="Company (optional)"
          value={data.company}
          onChange={e => handleField(section, 'company', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="Country"
          value={data.country}
          onChange={e => handleField(section, 'country', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="Street Address"
          value={data.address}
          onChange={e => handleField(section, 'address', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="City"
          value={data.city}
          onChange={e => handleField(section, 'city', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="State"
          value={data.state}
          onChange={e => handleField(section, 'state', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="Postal Code"
          value={data.postalCode}
          onChange={e => handleField(section, 'postalCode', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="Phone"
          value={data.phone}
          onChange={e => handleField(section, 'phone', e.target.value)}
          className="p-2 border w-full mt-2"
        />
        <input
          required
          placeholder="Email"
          type="email"
          value={data.email}
          onChange={e => handleField(section, 'email', e.target.value)}
          className="p-2 border w-full mt-2"
        />
      </>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-white shadow rounded p-6 space-y-6">
          <h2 className="text-xl font-bold">Billing Details</h2>
          {renderFields('billing')}

          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={formData.shipToDifferent}
              onChange={() =>
                setFormData(f => ({ ...f, shipToDifferent: !f.shipToDifferent }))}
              className="mr-2"
            />
            Ship to a different address?
          </label>

          {formData.shipToDifferent && (
            <>
              <h2 className="text-xl font-bold mt-4">Shipping Details</h2>
              {renderFields('shipping')}
            </>
          )}

          <textarea
            placeholder="Order Notes"
            value={formData.orderNotes}
            onChange={e => setFormData(f => ({ ...f, orderNotes: e.target.value }))}
            className="p-2 border w-full mt-4"
          />

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <label className="block mt-2">
              <input
                type="radio"
                name="payment"
                checked={formData.paymentMethod === 'stripe'}
                onChange={() => setFormData(f => ({ ...f, paymentMethod: 'stripe' }))}
                className="mr-2"
              />
              Stripe
            </label>
            <label className="block mt-1">
              <input
                type="radio"
                name="payment"
                checked={formData.paymentMethod === 'cod'}
                onChange={() => setFormData(f => ({ ...f, paymentMethod: 'cod' }))}
                className="mr-2"
              />
              Pay on Delivery
            </label>
          </div>

          <label className="block mt-4">
            <input
              type="checkbox"
              checked={formData.agreed}
              onChange={e => setFormData(f => ({ ...f, agreed: e.target.checked }))}
              className="mr-2"
            />
            I agree to the terms & conditions.
          </label>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-blue-800 font-bold text-xl py-3 rounded"
          >
            {formData.paymentMethod === 'stripe'
              ? `Pay $${total.toFixed(2)} with Stripe`
              : 'Place Order'}
          </button>
        </form>

        <aside className="w-full md:w-1/2">
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
                    <div key={i} className="flex justify-between py-2">
                      <span>
                        {it.name} × {it.quantity}
                      </span>
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
                <div className="flex justify-between pt-2">
                  <span>Discount</span>
                  <span>-${discountAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-4 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
