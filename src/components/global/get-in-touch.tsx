"use client";
import Link from "next/link";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function GetinTouch() {
    return (
      <div className="flex items-center space-x-6 py-8">

        <p className="text-2xl font-semibold">
          Get in Touch with Us (10 AM to 7 PM IST):
        </p>
        
        <a
          href="https://api.whatsapp.com/send/?phone=919137320348&text=Hello+HobbyistDecals%0D%0AI+need+a+help+with+HD+Decals%2C+https%3A%2F%2Fhobbyistdecals.com%2F&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#16689A] text-white text-lg px-5 py-3 rounded flex items-center space-x-2 hover:bg-black transition"
        >
          <span className="text-xl"><WhatsAppIcon /></span>
          <span>WhatsApp Chat</span>
        </a>

        <Link href="/contact-us" legacyBehavior>
            <button className="bg-[#16689A] text-white text-lg px-5 py-3 rounded flex items-center space-x-2 hover:bg-black transition">
                <span>Contact Us</span>
            </button>
        </Link>
        
      </div>
    );
  }
  
