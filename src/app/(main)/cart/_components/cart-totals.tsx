// app/_components/cart-totals.tsx
'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

interface CartItem {
    sku: string;
    name: string;
    price: number;
    media: string;
    scale: string;
    variation: string;
    quantity: number;
    image: string;
}

type CartTotalsProps = {
    subtotal: number;
    shipping: number;
};

const countries = [
    "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
    "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada",
    "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco",
    "Mongolia", "Montenegro", "Morocco", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Lucia", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Singapore", "Slovakia",
    "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom (UK)", "United States (US)", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu",
    "Delhi", "Lakshadweep", "Pondicherry(Puducherry)"
];

const countryOptions = countries.map((c) => ({ label: c, value: c }));
const stateOptions = indianStates.map((s) => ({ label: s, value: s }));

export default function CartTotals({ subtotal, shipping }: CartTotalsProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [country, setCountry] = useState<{ label: string; value: string } | null>(null);
    const [state, setState] = useState<{ label: string; value: string } | null>(null);
    const [city, setCity] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [rate, setRate] = useState(shipping);
    const [loading, setLoading] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [couponMessage, setCouponMessage] = useState('');

    const calculateAndSave = async () => {
        if (!country) {
            alert('Please select a country');
            return;
        }
        setLoading(true);
        try {
            const shipRes = await fetch('/api/shipping-rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country: country.value,
                    state: state?.value || '',
                    city,
                    pinCode,
                }),
            });
            if (!shipRes.ok) throw new Error('Rate lookup failed');
            const { rate: newRate } = await shipRes.json();
            setRate(newRate);

            const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cartItems.length === 0) {
                alert('Your cart is empty');
                return;
            }

            const saveRes = await fetch('/api/cart/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingAmount: newRate, // Still sending this for potential context or fallback on backend
                    cartItems,
                    discountAmount,
                    country: country.value, // Sending address information for backend shipping calculation
                    state: state?.value || '',
                    city,
                    pinCode,
                    couponCode: couponCode.trim() || null, // Added this line
                }),
            });

            if (!saveRes.ok) throw new Error('Save failed');
            const { cartId } = await saveRes.json();
            console.log('Saved cart ID:', cartId);
            alert('Cart & shipping saved!');
        } catch (e) {
            console.error(e);
            alert((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Enter a coupon code');
            return;
        }

        try {
            const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode)}`);
            const data = await res.json();

            if (!res.ok) {
                setDiscountPercent(0);
                setCouponMessage(data.error || 'Invalid coupon');
                return;
            }

            setDiscountPercent(data.discount_percent);
            setCouponMessage(`Coupon applied! ${data.discount_percent}% off`);
        } catch (error) {
            console.error('Coupon error:', error);
            setCouponMessage('Something went wrong');
        }
    };

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal + rate - discountAmount;

    return (
        <div className="w-full md:w-1/2 p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>

            <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${rate.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                </div>
            )}

            <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                />
                <button
                    onClick={applyCoupon}
                    className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                >
                    Apply Coupon
                </button>
                {couponMessage && (
                    <p className="text-sm mt-2 text-gray-700">{couponMessage}</p>
                )}
            </div>

            <button
                onClick={() => setShowForm((v) => !v)}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
                Calculate & Save Shipping
            </button>

            {showForm && (
                <div className="mt-4 space-y-3">
                    <Select
                        options={countryOptions}
                        value={country}
                        onChange={(v) => {
                            setCountry(v);
                            setState(null);
                            setRate(0);
                        }}
                        placeholder="Country"
                    />

                    {country?.value === 'India' && (
                        <Select
                            options={stateOptions}
                            value={state}
                            onChange={setState}
                            placeholder="State"
                        />
                    )}

                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border p-2 rounded"
                    />

                    <input
                        type="text"
                        placeholder="Pin Code"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full border p-2 rounded"
                    />

                    <button
                        onClick={calculateAndSave}
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Working…' : 'Calculate & Save'}
                    </button>
                </div>
            )}

            <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600"
            >
                Proceed to Checkout
            </button>
        </div>
    );
}
