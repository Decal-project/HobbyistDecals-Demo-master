"use client";
import Link from "next/link";

export default function GetinTouch() {
    return (
      <div className="flex items-center space-x-6 py-8">

        <p className="text-2xl font-semibold">
          Get in Touch with Us (10 AM to 7 PM IST):
        </p>
  
        <button
            className="bg-[#16689A] text-white text-lg px-5 py-3 rounded flex items-center space-x-2 hover:bg-black transition"
            onClick={() => window.open("https://join.skype.com/invite/wp89j0234p5R", "_blank")}
        >
            <span className="text-xl">💬</span>
            <span>Teams Chat</span>
        </button>

        <Link href="/contact-us" legacyBehavior>
            <button className="bg-[#16689A] text-white text-lg px-5 py-3 rounded flex items-center space-x-2 hover:bg-black transition">
                <span>Contact Us</span>
            </button>
        </Link>
        
      </div>
    );
  }
  
