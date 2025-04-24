'use client';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router

export default function AffiliateLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch("/api/affiliate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // ✅ Redirect to affiliate-dashboard
      router.push("/affiliate-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 self-stretch flex flex-col justify-start">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Log in affiliates
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-gray-800">
            Username / Email *
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#16689A] text-white font-semibold py-2 rounded hover:bg-black transition"
        >
          Login
        </button>

        <div className="text-sm mt-3 text-center text-gray-500">
          <a href="#" className="hover:underline">Lost your password?</a>
        </div>

        <div className="text-sm mt-2 text-center text-gray-700">
          To Sign Up Please{" "}
          <Link href="/affiliate-registration" className="text-blue-700 font-semibold hover:underline">
            click here
          </Link>
        </div>
      </form>
    </div>
  );
}
