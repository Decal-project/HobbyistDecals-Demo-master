"use client";
import {
  ChevronDown,
  CircleUserRound,
  EllipsisVertical,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const NavbarComponent = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${query}`); 
    }
  };
  return (
    <div className="min-h-fit w-full py-2 flex items-center justify-center bg-white">
      <div className="w-[95%] h-fit flex flex-row items-center justify-between gap-8">
        <Link href={"/"}>
          <Image
            src={
              "https://hobbyistdecals.com/wp-content/uploads/al_opt_content/IMAGE/hobbyistdecals.com/wp-content/uploads/2024/06/Hobbiyst-Logo-Icon-3-300x96.png.bv_resized_desktop.png.bv.webp"
            }
            alt="logo"
            width={0}
            height={0}
            quality={100}
            unoptimized
            draggable={false}
            className="h-[3.5rem] w-auto object-contain transform transition-transform duration-300 hover:scale-105"
          />
        </Link>
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
            className="bg-[#16689A] hover:bg-[#12557F] text-white p-3 rounded-r-full"
          >
            <Search size={20} />
          </button>
        </div>
        <div className="flex flex-row items-center justify-center gap-1.5">
          <CircleUserRound className="text-black w-6 h-6" />
          <p className="text-black capitalize text-lg">login</p>
          <ChevronDown className="text-black h-6 w-6" />
        </div>
        <div className="flex flex-row items-center justify-center gap-1.5 cursor-pointer" 
          onClick={() => router.push("/cart")}>
          <ShoppingCart className="text-black w-6 h-6" />
          <p className="text-black capitalize text-lg">Cart</p>
        </div>
        <div className="flex flex-row items-center justify-center gap-1.5">
          <Store className="text-black w-6 h-6" />
          <p className="text-black capitalize text-lg">become a seller</p>
        </div>
        <div>
          <EllipsisVertical className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default NavbarComponent;
