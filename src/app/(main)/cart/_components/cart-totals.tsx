'use client';

import React, { useState } from 'react';
import Select from 'react-select';

type CartTotalsProps = {
  subtotal: number;
  shipping: number; // Default fallback shipping
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
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand",
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

const countryOptions = countries.map((country) => ({ label: country, value: country }));
const stateOptions = indianStates.map((state) => ({ label: state, value: state }));

const CartTotals: React.FC<CartTotalsProps> = ({ subtotal, shipping }) => {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ label: string; value: string } | null>(null);
  const [selectedState, setSelectedState] = useState<{ label: string; value: string } | null>(null);
  const [shippingRate, setShippingRate] = useState<number>(shipping);
  const [loading, setLoading] = useState(false);

  const total = subtotal + shippingRate;

  const handleUpdateShipping = async () => {
    if (!selectedCountry) return;

    setLoading(true);
    try {
      const res = await fetch('/api/shipping-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry.value,
          state: selectedCountry.value === 'India' ? selectedState?.value : undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShippingRate(data.rate);
      } else {
        console.error('Rate fetch error:', data.message);
        alert(data.message || 'Could not update shipping.');
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      alert('Something went wrong while updating shipping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm border border-gray-200 rounded-md p-6 bg-white">
      <h2 className="text-lg font-semibold mb-6">Cart Totals</h2>

      {/* Subtotal */}
      <div className="flex justify-between mb-6">
        <span className="text-gray-700 font-semibold">Subtotal</span>
        <span className="text-gray-800 font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-1">
          <span className="text-gray-700 font-semibold">Shipping</span>
          <span className="text-gray-800 font-semibold">
            Flat rate: <span className="font-bold">${shippingRate.toFixed(2)}</span>
          </span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Shipping options will be updated during checkout.
        </p>
        <button
          onClick={() => setShowShippingForm(!showShippingForm)}
          className="text-sm text-blue-600 underline mt-1"
        >
          Calculate shipping
        </button>

        {showShippingForm && (
          <div className="mt-6 space-y-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country / region
              </label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(val) => {
                  setSelectedCountry(val);
                  setSelectedState(null); // Reset state if country changes
                }}
                placeholder="Select a country / region..."
                isSearchable
                styles={{
                  container: (provided) => ({ ...provided, fontSize: '0.875rem' }),
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                }}
              />
            </div>

            {/* State (only for India) */}
            {selectedCountry?.value === 'India' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  options={stateOptions}
                  value={selectedState}
                  onChange={setSelectedState}
                  placeholder="Select a state..."
                  isSearchable
                  styles={{
                    container: (provided) => ({ ...provided, fontSize: '0.875rem' }),
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                />
              </div>
            )}

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Town / City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* ZIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode / ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateShipping}
              disabled={
                !selectedCountry || (selectedCountry.value === 'India' && !selectedState) || loading
              }
              className="mt-2 border border-blue-400 text-gray-600 font-semibold px-6 py-2 rounded hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between text-base font-semibold mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button className="w-full bg-[#0074a5] hover:bg-[#005d87] text-white font-semibold py-3 rounded-md transition">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartTotals;
