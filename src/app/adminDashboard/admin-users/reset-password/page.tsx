"use client";

import React, { useState } from "react";
import Link from "next/link";

const AdminPasswordReset: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/resetAdminPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successfully!");
        setEmail("");
        setNewPassword("");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#f7f7f7] border-r p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <Link
              href="/adminDashboard"
              className="text-[#16689A] hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Reset Admin Password</h2>

          {message && <p className="text-green-600 mb-2">{message}</p>}
          {error && <p className="text-red-600 mb-2">{error}</p>}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="New password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#16689A] text-white py-2 rounded hover:bg-[#12557F]"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordReset;
