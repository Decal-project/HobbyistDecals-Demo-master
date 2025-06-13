'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PaypalButton from './atoms/paypal-button'; // Adjust the import path as needed
import Loader from './atoms/loader'; // Adjust the import path as needed

// ... (Interface definitions remain the same, they look good)

export default function CheckoutForm() {
    const router = useRouter();
    const [cart, setCart] = useState<CartForFrontend | null>(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Added for displaying errors

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
        setErrorMessage(null); // Clear previous errors
        try {
            const res = await fetch('/api/cart');
            if (!res.ok) {
                throw new Error(`Failed to fetch cart: ${res.statusText}`);
            }
            const data: CartForFrontend = await res.json();
            setCart(data);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setErrorMessage(`Error fetching cart: ${(error as Error).message}`); // Display error
            setCart(null);
        } finally {
            setLoadingCart(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const subtotalDisplay = cart?.subtotal_after_quantity_discounts ?? 0;
    const shippingAmtDisplay = cart?.shipping_cost ?? 0;
    const discountAmtDisplay = (cart?.total_quantity_discount_amount ?? 0) + (cart?.coupon_discount_amount ?? 0);
    const totalDisplay = subtotalDisplay + shippingAmtDisplay - discountAmtDisplay;

    useEffect(() => {
        // Load PayPal SDK only when PayPal is selected and not already loaded
        if (formData.paymentMethod === 'paypal' && !paypalLoaded) {
            // Check if window.paypal is already defined by a previous script, prevent re-loading
            if (typeof window.paypal !== 'undefined') {
                setPaypalLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID}&currency=USD`;
            script.async = true;
            script.onload = () => {
                setPaypalLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load PayPal SDK.');
                setErrorMessage('Failed to load PayPal payment options. Please try another method or refresh.'); // More specific error
            };
            document.body.appendChild(script);

            // Cleanup function for useEffect (optional, but good practice for scripts)
            return () => {
                // If you were removing the script, you'd do it here.
                // However, PayPal SDK is often left on the page once loaded.
            };
        }
    }, [formData.paymentMethod, paypalLoaded]); // Depend on paypalLoaded to prevent re-append

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
        e.preventDefault();
        setErrorMessage(null); // Clear previous errors

        if (formData.paymentMethod === 'paypal') {
            console.log("PayPal payment method selected. Not submitting form via traditional submit.");
            return;
        }

        if (!formData.agreed) {
            setErrorMessage('Please agree to the terms & conditions to proceed.'); // Use state for error message
            return;
        }

        const commonPayload = {
            // ... (your commonPayload remains the same, looks good)
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

            if (!res.ok) {
                throw new Error(json.error || 'Checkout failed');
            }

            if (formData.paymentMethod === 'stripe' && json.url) {
                window.location.href = json.url;
            } else if (formData.paymentMethod === 'cod') {
                router.push(`/thank-you?name=${formData.billing.firstName}&amount=${totalDisplay.toFixed(2)}`);
            }
        } catch (err) {
            console.error('Checkout error', err);
            setErrorMessage(`Checkout error: ${(err as Error).message}`);
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

                    {/* Display error message if any */}
                    {errorMessage && (
                        <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
                    )}

                    {/* Conditional rendering of PayPal button or traditional submit button */}
                    {formData.paymentMethod === 'paypal' && paypalLoaded ? (
                        <div className="mt-6">
                            <PaypalButton
                                disabled={!formData.agreed} // Disable button if terms not agreed
                                style={{
                                    text: 'Purchase with PayPal',
                                    loadingComponent: <Loader />,
                                }}
                                createOrder={async () => {
                                    setErrorMessage(null); // Clear previous errors
                                    if (!formData.agreed) {
                                        // This alert will trigger if the button somehow becomes active before agreed
                                        // But the disabled prop should prevent this for better UX
                                        setErrorMessage('Please agree to the terms before proceeding with PayPal.');
                                        throw new Error('User did not agree to terms.');
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
                                        setErrorMessage(`Failed to create PayPal order: ${(error as Error).message}`);
                                        throw error;
                                    }
                                }}
                                onApprove={async (data: PayPalOnApproveData) => {
                                    setErrorMessage(null); // Clear previous errors
                                    try {
                                        // Capture the PayPal order on your backend
                                        const captureRes = await fetch(`/api/capture-paypal-order/${data.orderID}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                        });
                                        const orderData = await captureRes.json();
                                        if (!captureRes.ok) {
                                            throw new Error(orderData.error || 'Failed to capture PayPal order');
                                        }
                                        console.log('PayPal Payment Successful!', orderData);

                                        // Then, submit the order details to your backend's /api/checkout
                                        const checkoutPayload = {
                                            // ... (your checkoutPayload remains the same, looks good)
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
                                            payment_method: 'paypal',
                                            cart_id: cart?.id,
                                            coupon_code: cart?.coupon_code_applied,
                                            total_amount: totalDisplay.toFixed(2),
                                            paypal_order_id: data.orderID,
                                            paypal_payer_id: data.payerID,
                                        };

                                        const res = await fetch('/api/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(checkoutPayload),
                                        });

                                        if (!res.ok) {
                                            const errorData = await res.json();
                                            console.error('Error saving order details for PayPal:', errorData);
                                            throw new Error(errorData.error || 'Failed to save order details after PayPal payment.');
                                        }

                                        router.push(`/thank-you?name=${formData.billing.firstName}&amount=${totalDisplay.toFixed(2)}&paymentMethod=paypal`);
                                    } catch (err) {
                                        console.error('PayPal Capture/Checkout Error:', err);
                                        setErrorMessage(`Failed to complete PayPal payment: ${(err as Error).message}`);
                                    }
                                }}
                                onCancel={() => {
                                    setErrorMessage('PayPal payment cancelled.');
                                }}
                                onError={(err: PayPalOnErrorData) => {
                                    console.error('PayPal Error:', err);
                                    setErrorMessage(`An error occurred during PayPal payment: ${err?.message || 'Unknown error'}`);
                                }}
                            />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-blue-800 font-bold text-xl py-3 rounded mt-6"
                            disabled={loadingCart || !cart || !formData.agreed}
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
