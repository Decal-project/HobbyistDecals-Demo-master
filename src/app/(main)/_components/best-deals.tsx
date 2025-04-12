import Image from "next/image";
import Link from "next/link";
import React from "react";

const BestDealsComponent = () => {
  return (
    <div className="w-full h-[300px] bg-white">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
        {/* 1st Image - Custom Decal Design */}
        <Link href="/custom-decal-design" className="w-full h-full">
          <div className="w-full h-full bg-black rounded-br-xl overflow-hidden">
            <Image
              src="/images/home-best-deals-img-1.png"
              alt="img 1"
              width={0}
              height={0}
              quality={100}
              unoptimized
              className="w-full h-full object-fill"
            />
          </div>
        </Link>

        {/* 2nd Image - Decal Shops */}
        <Link href="/decal-shop" className="w-full h-full">
          <div className="w-full h-full bg-black rounded-bl-xl overflow-hidden">
            <Image
              src="/images/home-best-deals-img-2.png"
              alt="img 2"
              width={0}
              height={0}
              quality={100}
              unoptimized
              className="w-full h-full object-fill"
            />
          </div>
        </Link>

        {/* 3rd Image - Join to Earn */}
        <Link href="/join-to-earn" className="w-full h-full">
          <div className="w-full h-full rounded-tr-xl overflow-hidden">
            <Image
              src="/images/home-best-deals-img-4.png"
              alt="img 3"
              width={0}
              height={0}
              quality={100}
              unoptimized
              className="w-full h-full object-fill"
            />
          </div>
        </Link>

        {/* 4th Image - Decal Print */}
        <Link href="/decal-print" className="w-full h-full">
          <div className="w-full h-full rounded-tl-xl overflow-hidden">
            <Image
              src="/images/home-best-deals-img-3.png"
              alt="img 4"
              width={0}
              height={0}
              quality={100}
              unoptimized
              className="w-full h-full object-fill"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BestDealsComponent;
