"use client";

import React, { useState } from "react";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PinterestIcon from "@mui/icons-material/Pinterest";
import Link from "next/link";

const FooterComponent = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    try {
      console.log("Submitting email:", email); // Log the email being sent
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessage(data.message);
      setEmail(""); // Reset email field after submission
    } catch (error: any) {
      setMessage(error.message || "Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-min w-full flex items-center justify-center pb-1 pt-10 bg-black">
      <div className="w-[90%] flex flex-col items-center justify-center gap-12">
        <div className="w-full flex flex-row items-start justify-between gap-8">
          {/* About Us */}
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">About Us</h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/" legacyBehavior>HobbyistDecals</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">Our Gallery</p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-media" legacyBehavior>Our Media</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/faq" legacyBehavior>FAQ</Link>
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">Resources</h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">Blogs</p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/decal-shop" legacyBehavior>Shop</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/contact-us" legacyBehavior>Contact Us</Link>
              </p>
            </div>
          </div>

          {/* Policies */}
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">Our Policy</h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-policies/shipping" legacyBehavior>Shipping Policy</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-policies/replacement" legacyBehavior>Replacement Policy</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-policies/gdpr" legacyBehavior>GDPR policy</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-policies/terms-and-conditions" legacyBehavior>Terms and Conditions</Link>
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <h2 className="w-full uppercase text-white font-semibold text-base text-start text-nowrap">
                Get 10% off your first purchase!
              </h2>
              <p className="text-white text-base leading-7 text-wrap">
                Special offers for subscribers. Don&apos;t miss out on exclusive deals.
              </p>
              <div className="w-full flex flex-row items-center justify-center border bg-primary rounded-xl px-[0.7rem] py-2 border-border gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-white border-none outline-none w-full rounded-md text-base bg-transparent placeholder:text-white"
                  placeholder="Enter your email"
                />
              </div>
              <button
                onClick={handleSubscribe}
                className="bg-[#16689A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md cursor-pointer transition-colors active:bg-red-600"
              >
                I&apos;m in!
              </button>
              {message && <p className="text-white text-sm mt-2 text-center">{message}</p>}
            </div>

            {/* Social Icons */}
            <div className="w-full flex flex-row items-center justify-center gap-3">
              <a href="https://www.facebook.com/HobbyistDecal/" target="_blank" rel="noopener noreferrer">
                <FacebookOutlinedIcon className="text-white !w-[30px] !h-[30px] hover:text-blue" />
              </a>
              <a href="https://www.instagram.com/hobbyist_decals_shop/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="text-white !w-[30px] !h-[30px] hover:text-blue" />
              </a>
              <a href="https://api.whatsapp.com/send/?phone=919137320348" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="text-white !w-[30px] !h-[30px] hover:text-blue" />
              </a>
              <a href="https://in.pinterest.com/hobbyist_decals/" target="_blank" rel="noopener noreferrer">
                <PinterestIcon className="text-white !w-[30px] !h-[30px] hover:text-blue" />
              </a>
              <a href="https://x.com/HobbyistDecals" target="_blank" rel="noopener noreferrer">
                <XIcon className="text-white !w-[30px] !h-[30px] hover:text-blue" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="w-full flex flex-col items-center justify-center gap-1">
          <div className="w-full h-[0.5px] bg-border"></div>
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">
            <p className="text-center lg:text-start text-base text-white">
              &copy; 2024 Hobbyist Decals. All rights reserved.
            </p>
            <p className="text-center lg:text-end text-white">
              Powered by{" "}
              <Link
                href="https://nexainnov.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                NexaInnov Solutions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterComponent;
