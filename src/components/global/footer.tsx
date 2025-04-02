"use client";

import { ArrowRight } from "lucide-react";
import React from "react";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PinterestIcon from "@mui/icons-material/Pinterest";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Link from "next/link";

const FooterComponent = () => {
  return (
    <div className="min-h-min w-full flex items-center justify-center pb-4 pt-12 bg-black">
      <div className="w-[90%] flex flex-col items-center justify-center gap-12">
        <div className="w-full flex flex-row items-start justify-between gap-8">
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">
              Pages
            </h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                Home
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                About Us
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Categories
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Shop
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Product Details
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
                Blog Details
              </p>
              <p className="text-white text-base text-nowrap uppercase">
                <Link href="/about-us/faq" legacyBehavior>FAQ</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/contact-us" legacyBehavior>Contact Us</Link>
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Collections
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-center gap-6">
            <h2 className="uppercase text-base text-white font-semibold">
              Utilities
            </h2>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="capitalize text-white text-base text-nowrap">
                Sign In
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                Sign Up
              </p>
              <p className="capitalize text-white text-base text-nowrap">
                <Link href="/about-us/our-policies/shipping-and-return" legacyBehavior>Replacement policy</Link>
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
              <FacebookOutlinedIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
              <InstagramIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
              <WhatsAppIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
              <PinterestIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
              <XIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
              <YouTubeIcon
                className="text-white cursor-pointer !w-[30px] !h-[30px] transform transition-all duration-300 hover:text-blue"
                fontSize="medium"
              />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-4">
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
