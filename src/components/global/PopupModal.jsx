"use client";
import { useEffect, useState } from "react";

export default function PopupModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000); // Show popup after 1 second

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setShow(false);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closePopup}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-gray-700"
          onClick={closePopup}
          aria-label="Close popup"
        >
          ×
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#16689A] mb-2">
          Sign Up & Save 10% On Your Next Order!*
        </h2>
        <p className="mb-4 text-gray-700">
          Be the first to know about new products, deals and events.
        </p>

        {/* Email Input */}
        <input
          type="email"
          placeholder="name@email.com"
          className="w-full border border-gray-300 p-2 rounded mb-3"
        />

        {/* Sign Up Button */}
        <button
          onClick={closePopup} // Replace this with actual sign-up logic later
          className="w-full bg-[#16689A] text-white py-2 rounded font-semibold"
        >
          SIGN UP
        </button>

        {/* Info */}
        <p className="text-xs text-gray-600 mt-2">
          By clicking sign up, you agree to receive info about our events and
          products. See our{" "}
          <a href="#" className="text-[#16689A] underline">
            privacy policy
          </a>
          .
        </p>
        <p className="text-xs text-gray-600 mt-1">
          *Some exclusions may apply. First-time subscribers only. Your discount code will be emailed to you.
        </p>

        {/* Text Alerts */}
        <p className="text-xs text-gray-600 mt-2">
          <a href="#" className="text-[#16689A] font-semibold underline">
            Sign up for HobbyistDecals Text Alerts!
          </a>
          <br />
          Never miss out – text <strong>HD</strong> to <strong>XXXXX</strong>
        </p>
      </div>
    </div>
  );
}
