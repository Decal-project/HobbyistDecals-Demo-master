"use client";

import { ArrowRight } from "lucide-react";
import React from "react";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PinterestIcon from "@mui/icons-material/Pinterest";
import Link from "next/link";

const FooterComponent = () => {
  return (
    <div className="min-h-min w-full flex items-center justify-center pb-1 pt-10 bg-black">
      <div className="w-[90%] flex flex-col items-center justify-center gap-12">
        <div className="w-full flex flex-row items-start justify-between gap-8">
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">
              About Us
            </h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                HobbyistDecals
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Our Gallery
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-media" legacyBehavior>Our Media</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/faq" legacyBehavior>FAQ</Link>
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">
              Resources
            </h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                Blogs
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Shop
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/contact-us" legacyBehavior>Contact Us</Link>
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">
              Our Policy
            </h2>
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
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <h2 className="w-full uppercase text-white font-semibold text-base text-start text-nowrap">
                10% off your first purchase
              </h2>
              <p className="text-white text-base leading-7 text-wrap">
                Special offers for subscribers. Don&apos;t miss out on future
                offers, new arrivals, & expert fashion tips.
              </p>
              <div className="w-full flex flex-row items-center justify-center border bg-primary rounded-xl px-[0.7rem] py-2 border-border gap-2">
                <input
                  type="text"
                  className="border-none outline-none w-full rounded-md text-base focus:outline-none focus:ring-1 focus:ring-primary bg-transparent"
                  placeholder="Enter your email"
                />
                <ArrowRight className="text-black transform transition-transform duration-300 hover:translate-x-1 cursor-pointer" />
              </div>
            </div>
            <div className="w-full flex flex-row items-center justify-center gap-4">
              <a href="https://www.facebook.com/HobbyistDecal/" target="_blank" rel="noopener noreferrer">
                <FacebookOutlinedIcon
                  className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                  fontSize="medium"
                />
              </a>
              <a href="https://www.instagram.com/hobbyist_decals_shop/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon
                  className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                  fontSize="medium"
                />
              </a>
              <a href="https://api.whatsapp.com/send/?phone=919137320348&text=Hello+HobbyistDecals%0D%0AI+need+a+help+with+HD+Decals%2C+https%3A%2F%2Fhobbyistdecals.com%2F&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon
                  className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                  fontSize="medium"
                />
              </a>
              <a href="https://in.pinterest.com/hobbyist_decals/" target="_blank" rel="noopener noreferrer">
                <PinterestIcon
                  className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                  fontSize="medium"
                />
              </a>
              <a href="https://x.com/HobbyistDecals" target="_blank" rel="noopener noreferrer">
                <XIcon
                  className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                  fontSize="medium"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-1">
          <div className="w-full h-[0.5px] bg-border"></div>
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">
            <p className="text-center lg:text-start text-base text-white">
              &copy; 2024 Hobbyist Decals. All rights reserved.
            </p>
            <p className="text-center lg:text-end text-white">
              Powered by &quot;
              <Link
                href={"https://nexainnov.com"}
                rel="noopener noreferrer"
                target="_blank"
                className="transform transition-all duration-300 hover:text-white hover:underline underline-offset-2 cursor-pointer"
              >
                NexaInnov Solutions
              </Link>
              &quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterComponent;
