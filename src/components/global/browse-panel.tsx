"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categories = [
  { name: "Truck Decals for Scale Models", path: "/categories/truck-decals" },
  { name: "Armor Decals for Model Enthusiasts", path: "/categories/armor-decals" },
  { name: "Model Railway & Train Decals for Enthusiasts", path: "/categories/train-decals" },
  { name: "Car Decals for Every Enthusiast", path: "/categories/car-decals" },
  { name: "Speed Car Decals for Model Enthusiasts", path: "/categories/speed-car-decals" },
  { name: "Midget Car Decals & Stripe", path: "/categories/midget-car-decals" },
  { name: "Aircraft Decals for scale Model", path: "/categories/aircraft-decals" },
  { name: "Pinstriping Decals for Classic & Custom Designs", path: "/categories/pinstriping-decals" },
  { name: "Logo & Symbol Decals for Every Occasion", path: "/categories/logo-symbol-decals" },
  { name: "German WWII Decals for Accurate Historical Models", path: "/categories/wwii-decals" },
  { name: "Bike Decals for Scale Models", path: "/categories/bike-decals" },
  { name: "Boat & Ship Decals for Scale Models | Custom Marine Graphics", path: "/categories/boat-ship-decals" },
  { name: "Graffiti Decals for HO Scale Models", path: "/categories/graffiti-decals" },
  { name: "Letters & Numbers Decals", path: "/categories/letters-numbers" },
  { name: "License Plate Decals | Custom & Personalized Designs", path: "/categories/license-plate-decals" },
  { name: "Locomotive Decals for Model Railroads | HO Scale & Custom Designs", path: "/categories/locomotive-decals" },
  { name: "Military Decals", path: "/categories/military-decals" },
  { name: "Trailer Decals | Custom, Vinyl & Professional Designs", path: "/categories/trailer-decals" },
  { name: "War Games Decals | Custom & Tactical Designs for Wargaming", path: "/categories/war-games-decals" },
  { name: "Others", path: "/categories/tools" },
];
const BrowsePanelComponent = () => {
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isPolicyDropdownOpen, setIsPolicyDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

  return (
    <div className="min-h-fit w-full py-3 flex items-center justify-center bg-white">
      <div className="w-[85%] h-full flex flex-row items-center justify-center gap-12 flex-nowrap">
        <Link href="/">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-hd-decals.jpg"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={50} 
              height={50}
              className="object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              HD Decals
            </p>
          </div>
        </Link>
        <div
          className="relative flex flex-col items-center justify-center gap-2 cursor-pointer"
          onMouseEnter={() => setIsAboutDropdownOpen(true)}
          onMouseLeave={() => setIsAboutDropdownOpen(false)}
        >
          <div className="relative flex flex-col items-center">
            <Image
              src={"/images/home-browse-panel-about-us.png"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={50}
              height={50}
              className="w-[50px] h-[50px] object-contain"
            />
            <div className="w-full flex flex-row items-center justify-center gap-1">
              <p className="capitalize font-semibold text-black text-base text-center transform transition-all duration-300 group-hover:text-link">
                about us
              </p>
              <ChevronDown 
                className={`w-5 h-5 text-black transform transition-all duration-300 
                  group-hover:text-link group-hover:rotate-180 
                  ${isAboutDropdownOpen ? "rotate-180 text-black-600" : ""}`}
              />
            </div>
            {isAboutDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-48 bg-white shadow-lg border border-gray-200 rounded-lg z-50 p-2"
                onMouseEnter={() => setIsAboutDropdownOpen(true)} 
                onMouseLeave={() => setIsAboutDropdownOpen(false)} 
              >
                <ul className="flex flex-col gap-2">
                  <li className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                    HobbyistDecals
                  </li>
                  <li className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                    Our Gallery
                  </li>
                  <li className="hover:bg-[#16689A] cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                  <Link href="/about-us/our-media" legacyBehavior>
                    <a className="block w-full px-4 py-2 text-black hover:text-white">Our Media</a>
                  </Link>
                  </li>
                  <li className="hover:bg-[#16689A] cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                    <Link href="/about-us/faq" legacyBehavior>
                      <a className="block w-full px-4 py-2 text-black hover:text-white">FAQ</a>
                    </Link>
                  </li>
                  {/* Our Policy Dropdown */}
                  <li
                    className="relative px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors flex justify-between"
                    onMouseEnter={() => setIsPolicyDropdownOpen(true)}
                    onMouseLeave={() => setIsPolicyDropdownOpen(false)}
                  >
                    Our Policy
                    <ChevronDown 
                      className={`w-5 h-5 text-black transform transition-all duration-300 
                        ${isPolicyDropdownOpen ? "rotate-180 text-black-600" : ""}`}
                    />
                    {isPolicyDropdownOpen && (
                      <div
                        className="absolute top-0 left-full ml-2 w-52 bg-white shadow-lg border border-gray-200 rounded-lg z-50 p-2"
                        onMouseEnter={() => setIsPolicyDropdownOpen(true)} 
                        onMouseLeave={() => setIsPolicyDropdownOpen(false)} 
                      >
                        <ul className="flex flex-col gap-2">
                          <li className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                          <Link href="/about-us/our-policies/shipping-and-return" legacyBehavior>
                            <a className="block w-full px-2 py-0.5 text-black hover:text-white">Shipping & Return Policy</a>
                          </Link>
                          </li>
                          <li className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                            <Link href="/about-us/our-policies/gdpr" legacyBehavior>
                              <a className="block w-full px-2 py-0.5 text-black hover:text-white">GDPR Policy</a>
                            </Link>
                          </li>
                          <li className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-300 last:border-none">
                            <Link href="/about-us/our-policies/terms-and-conditions" legacyBehavior>
                              <a className="block w-full px-2 py-0.5 text-black hover:text-white">Terms & Conditions</a>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <Link href="/custom-decal-design">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-custom-decal-design.png"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={0}
              height={0}
              className="w-[50px] h-[50px] object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              custom decal design
            </p>
          </div>
        </Link>
        <Link href="/decal-shop">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-decal-shop.png"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={0}
              height={0}
              className="w-[50px] h-[50px] object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              decal shop
            </p>
          </div>
        </Link>
        <Link href="/bulk-decals">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-bulk-decals.png"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={0}
              height={0}
              className="w-[50px] h-[50px] object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              bulk decals
            </p>
          </div>
        </Link>
        <Link href="/decal-print">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-decal-print.png"}
              alt="category_1_img"
              quality={100}
              unoptimized
              width={0}
              height={0}
              className="w-[50px] h-[50px] object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              decal print
            </p>
          </div>
        </Link>
        <div className="relative flex flex-col items-center justify-center gap-2 cursor-pointer">
          <Image src="/images/home-browse-panel-joinus.jpeg" alt="Categories" width={50} height={50} className="object-contain" />
            <div className="w-full flex flex-row items-center justify-center gap-1">
              <button className="capitalize font-semibold text-white text-base text-center hover:text-blue-600 bg-[#16689A] rounded-2xl p-3">
                JoinToEarn</button>
            </div>
        </div>
        <div
          className="relative flex flex-col items-center justify-center gap-2 cursor-pointer"
          onClick={() => setIsCategoriesDropdownOpen((prev) => !prev)}
        >
          <Image
            src={"/images/home-browse-panel-categories.png"}
            alt="category_1_img"
            quality={100}
            unoptimized
            width={0}
            height={0}
            className="w-[50px] h-[50px] object-contain"
          />
          <div className="w-full flex flex-row items-center justify-center gap-1">
            <p className="capitalize font-semibold text-black text-base text-center transform transition-all duration-300 group-hover:text-link">
              categories
            </p>
            <ChevronDown 
              className={`w-5 h-5 text-black transform transition-all duration-300 
                ${isCategoriesDropdownOpen ? "rotate-180 text-black-600" : ""}`}
            />
          </div>

          {isCategoriesDropdownOpen && (
            <div
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-48 bg-white shadow-lg border border-gray-200 rounded-lg z-50 p-2"
            >
              <ul className="flex flex-col gap-2">
                {categories.map((category, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 border-b border-gray-400 last:border-none"
                    onClick={() => setIsCategoriesDropdownOpen(false)} // closes dropdown on selection
                  >
                    <Link
                      href={`/category/${category.name}`}
                      className="block w-full h-full"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
          </div>

        )}
      </div>

      </div>
    </div>
  );
};

export default BrowsePanelComponent;
