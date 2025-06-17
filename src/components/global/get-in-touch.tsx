"use client";
import Link from "next/link";
import Image from 'next/image';

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
      >
        <Image
          src="/images/whatsapp-icon.jpg"
          alt="WhatsApp Chat"
          width={50}
          height={50}
        />
      </a>

      <Link 
        href="/contact-us" 
        // Added bg-white for a white background behind the image and increased padding for more space
        className="flex items-center justify-center p-3 rounded-full bg-white shadow-md hover:shadow-lg transition"
      >
        <Image
            src="/images/contact_us.jpg"
            alt="Contact Us"
            width={55} // Slightly increased size
            height={55} // Slightly increased size
        />
      </Link>
      
    </div>
  );
}
