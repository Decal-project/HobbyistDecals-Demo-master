'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PaypalButton from './atoms/paypal-button'; // Adjust the import path as needed
import Loader from './atoms/loader'; // Adjust the import path as needed

interface AddressFields {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
}

interface CheckoutFormData {
    billing: AddressFields;
    shipping: AddressFields;
    shipToDifferent: boolean;
    orderNotes: string;
    paymentMethod: 'stripe' | 'cod' | 'paypal';
    agreed: boolean;
}

// *** IMPORTANT: This interface assumes your /api/cart endpoint is updated ***
interface CartItemForFrontend {
    sku: string;
    name: string;
    quantity: number;
    price_for_display: number; // Unit price after quantity-based discounts
}

// *** IMPORTANT: This interface assumes your /api/cart endpoint is updated ***
interface CartForFrontend {
    id: number;
    subtotal_after_quantity_discounts: number; // Sum of (price_for_display * quantity) for all items
    total_quantity_discount_amount: number; // Total amount of quantity discounts applied
    coupon_discount_amount: number; // Total amount of coupon discount applied (from DB)
    shipping_cost: number;
    final_total_amount: number; // subtotal_after_quantity_discounts - coupon_discount_amount + shipping_cost (from DB)
    coupon_code_applied: string | null; // The coupon code applied if any (from DB)
    items: CartItemForFrontend[]; // The array of items, each with its calculated display price
}

interface PayPalOnApproveData {
    orderID: string;
    payerID: string;
}

interface PayPalOnErrorData {
    message?: string;
}

export default function CheckoutForm() {
    const router = useRouter();
    const [cart, setCart] = useState<CartForFrontend | null>(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
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
    };

    const [formData, setFormData] = useState<CheckoutFormData>({
        billing: { ...emptyAddr },
        shipping: { ...emptyAddr },
        shipToDifferent: false,
        orderNotes: '',
        paymentMethod: 'stripe',
        agreed: false,
    });

    const fetchCart = async () => {
        setLoadingCart(true);
        try {
            const res = await fetch('/api/cart');
            if (!res.ok) {
                throw new Error(`Failed to fetch cart: ${res.statusText}`);
            }
            const data: CartForFrontend = await res.json();
            setCart(data);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCart(null);
        } finally {
            setLoadingCart(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []); // Fetch cart on component mount

    const subtotalDisplay = cart?.subtotal_after_quantity_discounts ?? 0;
    const shippingAmtDisplay = cart?.shipping_cost ?? 0;
    const discountAmtDisplay = (cart?.total_quantity_discount_amount ?? 0) + (cart?.coupon_discount_amount ?? 0);
    const totalDisplay = subtotalDisplay + shippingAmtDisplay - discountAmtDisplay;

    useEffect(() => {
        if (formData.paymentMethod === 'paypal' && !paypalLoaded) {
            const script = document.createElement('script');
            // Ensure NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID is defined in your .env.local
            // If you are using production, change 'sandbox' to 'production' in the client-id URL.
            script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID}&currency=USD`;
            script.async = true;
            script.onload = () => {
                setPaypalLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load PayPal SDK.');
                alert('Failed to load PayPal payment options.');
            };
            document.body.appendChild(script);
        }
    }, [formData.paymentMethod, paypalLoaded]);

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
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission

        // If PayPal is selected, the form should not be submitted via this function.
        // The PayPal button handles its own submission flow.
        if (formData.paymentMethod === 'paypal') {
            console.log("PayPal payment method selected. Not submitting form via traditional submit.");
            return; // Exit early
        }

        if (!formData.agreed) {
            alert('Please agree to the terms.');
            return;
        }

        const commonPayload = {
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
            payment_method: formData.paymentMethod, // This will be 'stripe' or 'cod' here
            cart_id: cart?.id,
            coupon_code: cart?.coupon_code_applied,
            total_amount: totalDisplay.toFixed(2),
        };

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commonPayload),
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Checkout failed');

            if (formData.paymentMethod === 'stripe' && json.url) {
                window.location.href = json.url;
            } else if (formData.paymentMethod === 'cod') {
                router.push(`/thank-you?name=${formData.billing.firstName}&amount=${totalDisplay.toFixed(2)}`);
            }
        } catch (err) {
            console.error('Checkout error', err);
            alert((err as Error).message);
        }
    };

    const renderFields = (section: 'billing' | 'shipping') => {
        const sectionData = formData[section];
        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        required
                        placeholder="First Name"
                        value={sectionData.firstName}
                        onChange={e => handleField(section, 'firstName', e.target.value)}
                        className="p-2 border"
                    />
                    <input
                        required
                        placeholder="Last Name"
                        value={sectionData.lastName}
                        onChange={e => handleField(section, 'lastName', e.target.value)}
                        className="p-2 border"
                    />
                </div>
                <input
                    placeholder="Company (optional)"
                    value={sectionData.company}
                    onChange={e => handleField(section, 'company', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="Country"
                    value={sectionData.country}
                    onChange={e => handleField(section, 'country', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="Street Address"
                    value={sectionData.address}
                    onChange={e => handleField(section, 'address', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="City"
                    value={sectionData.city}
                    onChange={e => handleField(section, 'city', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="State"
                    value={sectionData.state}
                    onChange={e => handleField(section, 'state', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="Postal Code"
                    value={sectionData.postalCode}
                    onChange={e => handleField(section, 'postalCode', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="Phone"
                    value={sectionData.phone}
                    onChange={e => handleField(section, 'phone', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
                <input
                    required
                    placeholder="Email"
                    type="email"
                    value={sectionData.email}
                    onChange={e => handleField(section, 'email', e.target.value)}
                    className="p-2 border w-full mt-2"
                />
            </>
        );
    };

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
                        <label className="block mt-1">
                            <input
                                type="radio"
                                name="payment"
                                checked={formData.paymentMethod === 'paypal'}
                                onChange={() => setFormData(f => ({ ...f, paymentMethod: 'paypal' }))}
                                className="mr-2"
                            />
                            PayPal
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

                    {/* Conditional rendering of PayPal button or traditional submit button */}
                    {formData.paymentMethod === 'paypal' && paypalLoaded ? (
                        <div className="mt-6">
                            <PaypalButton
                                // No 'type="submit"' here, as it's handled by PayPal SDK
                                style={{
                                    text: 'Purchase with PayPal',
                                    loadingComponent: <Loader />,
                                }}
                                createOrder={async () => {
                                    if (!formData.agreed) {
                                        alert('Please agree to the terms before proceeding with PayPal.');
                                        throw new Error('User did not agree to terms.'); // Prevent order creation
                                    }
                                    try {
                                        const res = await fetch('/api/create-paypal-order', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                cartId: cart?.id,
                                                totalAmount: totalDisplay.toFixed(2),
                                                currency: 'USD',
                                            }),
                                        });
                                        const order = await res.json();
                                        if (!res.ok) {
                                            throw new Error(order.error || 'Failed to create PayPal order');
                                        }
                                        return order.id; // This is the PayPal Order ID
                                    } catch (error) {
                                        console.error('Error creating PayPal order:', error);
                                        alert(`Failed to create PayPal order: ${(error as Error).message}`);
                                        throw error; // Re-throw to prevent PayPal from continuing
                                    }
                                }}
                                onApprove={async (data: PayPalOnApproveData) => {
                                    try {
                                        // This 'captureRes' might not be strictly necessary if your /api/checkout
                                        // handles the capture itself, but it's fine for now if your backend
                                        // capture-paypal-order endpoint also does this.
                                        const captureRes = await fetch(`/api/capture-paypal-order/${data.orderID}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            // You might need to send more data for the capture if your backend requires it
                                        });
                                        const orderData = await captureRes.json();
                                        if (!captureRes.ok) {
                                            throw new Error(orderData.error || 'Failed to capture PayPal order');
                                        }
                                        console.log('PayPal Payment Successful!', orderData);

                                        // Now, submit the order details to your backend's /api/checkout
                                        const checkoutPayload = {
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
                                            payment_method: 'paypal', // Explicitly set payment method to 'paypal'
                                            cart_id: cart?.id,
                                            coupon_code: cart?.coupon_code_applied,
                                            total_amount: totalDisplay.toFixed(2),
                                            paypal_order_id: data.orderID, // Pass PayPal Order ID
                                            paypal_payer_id: data.payerID, // Pass PayPal Payer ID
                                        };

                                        const res = await fetch('/api/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(checkoutPayload),
                                        });

                                        if (!res.ok) {
                                            const errorData = await res.json();
                                            console.error('Error saving order details for PayPal:', errorData);
                                            alert('Failed to save order details after PayPal payment.');
                                            return;
                                        }

                                        router.push(`/thank-you?name=${formData.billing.firstName}&amount=${totalDisplay.toFixed(2)}&paymentMethod=paypal`); // Redirect after successful payment and order save
                                    } catch (err) {
                                        console.error('PayPal Capture/Checkout Error:', err);
                                        alert(`Failed to complete PayPal payment: ${(err as Error).message}`);
                                    }
                                }}
                                onCancel={() => {
                                    alert('PayPal payment cancelled.');
                                }}
                                onError={(err: PayPalOnErrorData) => {
                                    console.error('PayPal Error:', err);
                                    alert(`An error occurred during PayPal payment: ${err?.message || 'Unknown error'}`);
                                }}
                            />
                        </div>
                    ) : (
                        // This button is only for Stripe and COD. The form's onSubmit will handle it.
                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-blue-800 font-bold text-xl py-3 rounded mt-6"
                            disabled={loadingCart || !cart || !formData.agreed} // Disable if cart not loaded or terms not agreed
                        >
                            {formData.paymentMethod === 'stripe'
                                ? `Pay $${totalDisplay.toFixed(2)} with Stripe`
                                : 'Place Order'}
                        </button>
                    )}
                </form>

                <aside className="w-full md:w-1/2">
                    <section className="bg-white shadow rounded p-6">
                        <h2 className="text-xl font-bold mb-4">Your Order</h2>
                        {loadingCart ? (
                            <p>Loading…</p>
                        ) : !cart || cart.items.length === 0 ? (
                            <p>No items in cart.</p>
                        ) : (
                            <>
                                <div className="divide-y">
                                    {cart.items.map((it, i) => (
                                        <div key={it.sku || i} className="flex justify-between py-2">
                                            <span>
                                                {it.name} × {it.quantity}
                                            </span>
                                            <span>${(it.price_for_display * it.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between font-semibold pt-4">
                                    <span>Subtotal</span>
                                    <span>${subtotalDisplay.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span>Shipping</span>
                                    <span>${shippingAmtDisplay.toFixed(2)}</span>
                                </div>
                                {discountAmtDisplay > 0 && (
                                    <div className="flex justify-between pt-2">
                                        <span>Total Savings</span>
                                        <span>-${discountAmtDisplay.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold pt-4 border-t">
                                    <span>Total</span>
                                    <span>${totalDisplay.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}
