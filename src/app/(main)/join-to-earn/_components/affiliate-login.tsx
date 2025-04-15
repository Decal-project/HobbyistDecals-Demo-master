import React from "react";

export default function AffiliateLogin() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 self-stretch flex flex-col justify-start">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Log in affiliates
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-gray-800">
            Username / Email *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">
            Password *
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
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
          To Sign Up Please <a href="#" className="text-blue-700 font-semibold hover:underline">click here</a>
        </div>
      </form>
    </div>
  );
}
