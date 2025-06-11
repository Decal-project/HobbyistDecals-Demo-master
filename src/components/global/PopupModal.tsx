"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function PopupModal() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);

  const startInactivityTimer = useCallback(() => {
    inactivityTimeout.current = setTimeout(() => {
      closePopup();
    }, 15000);
  }, []);

  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }
    startInactivityTimer();
  };

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");

    if (!hasSeenPopup) {
      const initialTimer = setTimeout(() => {
        setShow(true);
        startInactivityTimer();
      }, 10000);

      return () => clearTimeout(initialTimer);
    }
  }, [startInactivityTimer]);

  const closePopup = () => {
    setShow(false);
    sessionStorage.setItem("hasSeenPopup", "true");
    setEmail("");
    setMessage("");
    setMessageType("");
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!email) {
      setMessage("Please enter your email.");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("Thank you for subscribing! Your discount code will be emailed shortly.");
        setMessageType("success");
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
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={closePopup}
    >
      <div
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-10 rounded-xl max-w-xl w-full relative shadow-2xl animate__animated animate__fadeIn"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetInactivityTimer}
        onKeyDown={resetInactivityTimer}
      >
        <button
          className="absolute top-4 right-4 text-4xl font-extrabold text-gray-400 hover:text-gray-600 transition-colors"
          onClick={closePopup}
          aria-label="Close popup"
        >
          ×
        </button>
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-[#16689A] mb-6 animate__animated animate__bounceIn">
            🎉 Sign Up & Get 10% Off Your Next Order! 🎉
          </h2>
          <p className="mb-8 text-lg text-gray-700">
            Don&apos;t miss out on exclusive deals, new arrivals, and exciting updates from HobbyistDecals. Subscribe now and save!
          </p>

          <form onSubmit={handleSubscribe} className="space-y-6">
            {message && (
              <p
                className={`text-lg text-center ${
                  messageType === "success" ? "text-green-600" : "text-red-500"
                } animate__animated animate__shakeX`}
              >
                {message}
              </p>
            )}

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-4 rounded-lg text-lg focus:ring-2 focus:ring-[#16689A]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#16689A] text-white py-4 rounded-lg font-semibold text-xl hover:bg-[#12557F] transition-colors shadow-md hover:shadow-lg animate__animated animate__pulse hover:animate__none"
            >
              SUBSCRIBE & GET YOUR DISCOUNT
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-4">
            By clicking sign up, you agree to receive info about our events and
            products. See our{" "}
            <a href="#" className="text-[#16689A] underline">
              privacy policy
            </a>
            .
          </p>
          <p className="text-xs text-gray-600 mt-2">
            *Some exclusions may apply. First-time subscribers only. Your discount code will be emailed to you.
          </p>
          <p className="text-xs text-gray-600 mt-4">
            <a href="#" className="text-[#16689A] font-semibold underline">
              Sign up for HobbyistDecals Text Alerts!
            </a>
            <br />
            Never miss out – text <strong>HD</strong> to <strong>9137320348</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
