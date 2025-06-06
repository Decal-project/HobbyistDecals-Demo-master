"use client";
import {
  CircleUserRound,
  EllipsisVertical,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const NavbarComponent = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${query}`);
    }
  };

  // Close More dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreRef.current &&
        !(moreRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-fit w-full py-2 flex items-center justify-center bg-white shadow-sm">
      <div className="w-[95%] h-fit flex flex-row items-center justify-between gap-8">
        {/* Logo */}
        <Link href={"/"}>
          <Image
            src="https://hobbyistdecals.com/wp-content/uploads/al_opt_content/IMAGE/hobbyistdecals.com/wp-content/uploads/2024/06/Hobbiyst-Logo-Icon-3-300x96.png.bv_resized_desktop.png.bv.webp"
            alt="logo"
            width={0}
            height={0}
            quality={100}
            unoptimized
            draggable={false}
            className="h-[3.5rem] w-auto object-contain transform transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Search */}
        <div className="flex items-center bg-white border border-gray-400 rounded-full shadow-md w-[40%] max-w-md">
          <input
            type="text"
            placeholder="Search for more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-grow px-4 py-2 text-gray-700 bg-white rounded-l-full focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-[#BEE2F3] hover:bg-blue-400 text-black p-3 rounded-r-full"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Login and Admin Login */}
        <div className="flex items-center gap-4">
          {/* Login Button */}
          <button
            onClick={() => router.push("/user-login")}
            className="flex flex-row items-center justify-center gap-1.5 bg-[#BEE2F3] text-black px-4 py-2 rounded-md hover:bg-blue-400 transition-colors duration-300"
          >
            <CircleUserRound className="w-5 h-5" />
            <span className="text-base font-medium">Login</span>
          </button>
        </div>

        {/* Cart */}
        <Link href="/cart">
          <div
            className="flex flex-row items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => router.push("/cart")}
          >
            <ShoppingCart className="text-black w-6 h-6" />
            <p className="text-black capitalize text-lg">Cart</p>
          </div>
        </Link>

        {/* Become a Seller */}
        <div className="flex flex-row items-center justify-center gap-1.5 cursor-pointer">
          <Store className="text-black w-6 h-6" />
          <p className="text-black capitalize text-lg">become a seller</p>
        </div>

        {/* More Options Dropdown */}
        <div
          className="relative cursor-pointer"
          onClick={() => setMoreOpen((prev) => !prev)}
          ref={moreRef}
        >
          <EllipsisVertical className="h-6 w-6" />
          {moreOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-gray-300 last:border-none">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#16689A] hover:text-white transition-colors duration-300"
                  >
                    HD Decals
                  </Link>
                </li>
                <li className="border-b border-gray-300 last:border-none">
                  <Link
                    href="/custom-decal-design"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#16689A] hover:text-white transition-colors duration-300"
                  >
                    Custom Decal Design
                  </Link>
                </li>
                <li className="border-b border-gray-300 last:border-none">
                  <Link
                    href="/decal-shop"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#16689A] hover:text-white transition-colors duration-300"
                  >
                    Decal Shop
                  </Link>
                </li>
                <li className="border-b border-gray-300 last:border-none">
                  <Link
                    href="/bulk-decals"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#16689A] hover:text-white transition-colors duration-300"
                  >
                    Bulk Decals
                  </Link>
                </li>
                <li className="border-b border-gray-300 last:border-none">
                  <Link
                    href="/decal-print"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#16689A] hover:text-white transition-colors duration-300"
                  >
                    Decal Print
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavbarComponent;
