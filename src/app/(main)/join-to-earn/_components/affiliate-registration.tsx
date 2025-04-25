'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  paymentEmail: string;
  website: string;
  promotion: string;
  agree: boolean;
}

const AffiliateRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    paymentEmail: '',
    website: '',
    promotion: '',
    agree: false,
  });

  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    let fieldValue: string | boolean = value;

    if (type === 'checkbox') {
      fieldValue = checked; // Checkbox will use the checked property instead of value
    }

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agree) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    try {
      const response = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful!');
        router.push('/login'); // Redirect to login
      } else {
        alert(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 px-4 py-8 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Affiliate Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Username', name: 'username', type: 'text' },
          { label: 'First Name', name: 'firstname', type: 'text' },
          { label: 'Last Name', name: 'lastname', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Password', name: 'password', type: 'password' },
          { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
          { label: 'Payment Email', name: 'paymentEmail', type: 'email' },
          { label: 'Website', name: 'website', type: 'url' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-medium mb-1">{field.label} *</label>
            <input
              name={field.name}
              type={field.type}
              value={field.type === 'checkbox' ? undefined : formData[field.name as keyof FormData]} // Only provide value for non-checkbox inputs
              checked={field.type === 'checkbox' ? formData[field.name as keyof FormData] : undefined} // Only set checked for checkboxes
              onChange={handleChange}
              required={field.name !== 'website'}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block font-medium mb-1">How will you promote us?</label>
          <textarea
            name="promotion"
            rows={4}
            value={formData.promotion} // Textareas are string values
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-start">
          <input
            name="agree"
            type="checkbox"
            checked={formData.agree} // Checkbox binding with 'agree' field
            onChange={handleChange}
            className="mt-1 mr-2"
            required
          />
          <label className="text-sm text-gray-700">
            I agree to the <a href="#" className="text-blue-600 underline">terms and conditions</a> and <a href="#" className="text-blue-600 underline">privacy policy</a>.
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default AffiliateRegistration;
