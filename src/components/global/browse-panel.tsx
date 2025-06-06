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
        <Link href="/custom-decal-design">
          <div className="flex flex-col items-center justify-center gap-2 cursor-pointer transform transition-transform duration-300 hover:scale-95">
            <Image
              src={"/images/home-browse-panel-custom-decal-design.png"}
              alt="custom_decal_img"
              quality={100}
              unoptimized
              width={50}
              height={50}
              className="object-contain"
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
              alt="decal_shop_img"
              quality={100}
              unoptimized
              width={50}
              height={50}
              className="object-contain"
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
              alt="bulk_decals_img"
              quality={100}
              unoptimized
              width={50}
              height={50}
              className="object-contain"
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
              alt="decal_print_img"
              quality={100}
              unoptimized
              width={50}
              height={50}
              className="object-contain"
            />
            <p className="capitalize font-semibold text-black text-base text-center">
              decal print
            </p>
          </div>
        </Link>
        <Link href="/join-to-earn">
          <div className="relative flex flex-col items-center justify-center gap-2 cursor-pointer">
            <Image
              src="/images/home-browse-panel-joinus.jpeg"
              alt="join_to_earn_img"
              width={50}
              height={50}
              className="object-contain"
            />
            <div className="w-full flex flex-row items-center justify-center gap-1">
              <button className="capitalize font-semibold text-white text-base text-center bg-[#16689A] hover:bg-black rounded-2xl p-3">
                JoinToEarn
              </button>
            </div>
          </div>
        </Link>
        <div
          className="relative flex flex-col items-center justify-center gap-2 cursor-pointer"
          onClick={() => setIsCategoriesDropdownOpen((prev) => !prev)}
        >
          <Image
            src={"/images/home-browse-panel-categories.png"}
            alt="categories_img"
            quality={100}
            unoptimized
            width={50}
            height={50}
            className="object-contain"
          />
          <div className="w-full flex flex-row items-center justify-center gap-1">
            <p className="capitalize font-semibold text-black text-base text-center">
              categories
            </p>
            <ChevronDown
              className={`w-5 h-5 text-black transition-all duration-300 ${
                isCategoriesDropdownOpen ? "rotate-180 text-black-600" : ""
              }`}
            />
          </div>


          {isCategoriesDropdownOpen && (
  <div
    className="absolute top-full mt-2 left-1/2 w-[800px] bg-white shadow-lg border border-gray-200 rounded-lg z-50 p-4"
    style={{ transform: 'translateX(-60%)' }}
  >
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <li
          key={index}
          className="hover:bg-[#16689A] hover:text-white text-black cursor-pointer text-sm transition-colors duration-300 rounded px-3 py-2"
          onClick={() => setIsCategoriesDropdownOpen(false)}
        >
          <Link href={`/category/${category.name}`} className="block w-full h-full">
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
