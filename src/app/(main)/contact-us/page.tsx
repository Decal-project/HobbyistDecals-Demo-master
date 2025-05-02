"use client";

import React, { useState } from "react";
import { Mail, MapPin } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({ success: true });
        setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      } else {
        setResponse({ error: data.error || "Submission failed." });
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setResponse({ error: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white-100 min-h-screen mt-8">
        <div className="w-full">
          <img
            src="/images/home-best-deals-img-2.png"
            alt="Contact Us"
            className="w-full h-56 md:h-64 object-cover"
          />
        </div>

        <div className="bg-white-100 min-h-screen flex items-center justify-center py-9 px-4">
          <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg flex flex-col md:flex-row -mt-20">
            {/* Left Section */}
            <div className="p-8 w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-900">
                Get in Touch with Hobbyist Decals
              </h2>
              <p className="text-gray-600 mt-2">
                Crafting high-quality, custom decals to bring your scale models to life with
                exceptional detail and realism.
              </p>

              <div className="mt-6 space-y-4">
                {/* Location */}
                <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4 border border-gray-200 w-full">
                  <div className="bg-[#16689A] w-12 h-12 flex items-center justify-center rounded-2xl">
                    <MapPin className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">LOCATION ADDRESS:</p>
                    <p className="text-gray-600 text-sm">Kasturi Pride Complex, NIKOL 382350 INDIA</p>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4 border border-gray-200 w-full">
                  <div className="bg-[#16689A] w-12 h-12 flex items-center justify-center rounded-2xl">
                    <Mail className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">EMAIL ADDRESS:</p>
                    <p className="text-gray-600 text-sm">info@hobbyistdecals.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Form */}
            <div className="p-8 w-full md:w-1/2 bg-gray-50 rounded-lg">
              <form
                className="bg-white shadow-md p-6 rounded-lg border border-gray-200 w-full"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 font-semibold">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-gray-700 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="info@hobbyistdecals.com"
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-gray-700 font-semibold">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Telephone"
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-gray-700 font-semibold">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="Your message"
                    className="w-full mt-1 p-2 border rounded-md h-24"
                  ></textarea>
                </div>

                {response?.success && (
                  <p className="mt-4 text-green-600 font-medium">Message submitted successfully!</p>
                )}
                {response?.error && (
                  <p className="mt-4 text-red-600 font-medium">Error: {response.error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-[#16689A] text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center py-4">
          <iframe
            className="w-full max-w-4xl h-64 border-0 rounded-lg shadow-md"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14690.567186979894!2d72.63584766809564!3d23.0664413443547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f02d34f6ff%3A0x6bd17b2f378ab888!2sKasturi%20Pride%2C%20Nikol%2C%20Ahmedabad%2C%20Gujarat%20382350!5e0!3m2!1sen!2sin!4v1710653281182!5m2!1sen!2sin"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
