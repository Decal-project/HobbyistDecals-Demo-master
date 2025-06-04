// Assuming this is in a file like src/components/PopupModal.tsx or similar
"use client";
import { useEffect, useState } from "react";

export default function PopupModal() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState(""); // State for the email input
  const [message, setMessage] = useState(""); // State for success/error messages
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    ""
  ); // State for message type (e.g., for styling)

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000); // Show popup after 1 second

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setShow(false);
    sessionStorage.setItem("hasSeenPopup", "true"); // Store only for this session
    setEmail(""); // Clear email on close
    setMessage(""); // Clear messages on close
    setMessageType("");
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(""); // Clear previous messages
    setMessageType("");

    if (!email) {
      setMessage("Please enter your email.");
      setMessageType("error");
      return;
    }

    try {
      // Step 1: Send the email to your backend API
      // You'll need to create a new API route for subscriptions (e.g., /api/subscribe)
      const res = await fetch("/api/subscribe", { // <--- You need to create this API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("Thank you for subscribing! Your discount code will be emailed shortly.");
        setMessageType("success");
        // Optionally, you might close the popup after a delay or keep it open with the success message
        // setTimeout(closePopup, 3000); // Close after 3 seconds
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to subscribe. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage("An error occurred. Please try again later.");
      setMessageType("error");
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closePopup} // Close popup if clicking outside
    >
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside popup
      >
        <button
          className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-gray-700"
          onClick={closePopup}
          aria-label="Close popup"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-[#16689A] mb-2">
          Sign Up & Save 10% On Your Next Order!*
        </h2>
        <p className="mb-4 text-gray-700">
          Be the first to know about new products, deals and events.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-3">
          {message && (
            <p
              className={`text-sm text-center ${
                messageType === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <input
            type="email"
            placeholder="name@email.com"
            value={email} // Controlled input
            onChange={(e) => setEmail(e.target.value)} // Update email state
            className="w-full border border-gray-300 p-2 rounded"
            required // HTML5 validation for email
          />
          <button
            type="submit" // Changed to type="submit" for form handling
            className="w-full bg-[#16689A] text-white py-2 rounded font-semibold hover:bg-[#12557F] transition-colors"
          >
            SIGN UP
          </button>
        </form>

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
