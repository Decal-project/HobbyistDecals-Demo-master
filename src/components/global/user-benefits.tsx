import Image from "next/image";
import React from "react";

const UserBenefitsComponent = () => {
  return (
    <div className="w-full h-fit bg-white py-4 px-8 flex flex-row items-center justify-center gap-12">
      <div className="flex-1 h-full flex flex-row items-center justify-start gap-4">
        <Image
          src={"/images/home-user-benefits-custom-decal-design.png"}
          alt="img 1"
          width={0}
          height={0}
          unoptimized
          quality={100}
          className="h-10 w-10 object-cover"
        />
        <div className="flex flex-col items-start justify-center gap-1">
          <h2 className="text-sm uppercase text-nowrap text-black">
            custom decal designs
          </h2>
          <p className="text-sm text-grey">$25 / Hr</p>
        </div>
      </div>
      <div className="h-[2.5rem] w-[0.5px] bg-border"></div>
      <div className="flex-1 h-full flex flex-row items-center justify-start gap-4">
        <Image
          src={"/images/home-user-benefits-hd-printing.png"}
          alt="img 1"
          width={0}
          height={0}
          unoptimized
          quality={100}
          className="h-11 w-11 object-cover"
        />
        <div className="flex flex-col items-start justify-center gap-1">
          <h2 className="text-sm uppercase text-nowrap text-black">
            hd printing (1440 to 720 DPI)
          </h2>
          <p className="text-sm text-grey">(CMYKLcLm + Metallic + White)</p>
        </div>
      </div>
      <div className="h-[2.5rem] w-[0.5px] bg-border"></div>
      <div className="flex-1 h-full flex flex-row items-center justify-start gap-4">
        <Image
          src={"/images/home-user-benefits-precut-decals.png"}
          alt="img 1"
          width={0}
          height={0}
          unoptimized
          quality={100}
          className="h-12 w-12 object-cover"
        />
        <div className="flex flex-col items-start justify-center gap-1">
          <h2 className="text-sm uppercase text-nowrap text-black">
            Precut Decals
          </h2>
          <p className="text-sm text-grey">0.7mm ~</p>
        </div>
      </div>
      <div className="h-[2.5rem] w-[0.5px] bg-border"></div>
      <div className="flex-1 h-full flex flex-row items-center justify-start gap-4">
        <Image
          src={"/images/home-user-benefits-payments.png"}
          alt="img 1"
          width={0}
          height={0}
          unoptimized
          quality={100}
          className="h-12 w-12 object-cover"
        />
        <div className="flex flex-col items-start justify-center gap-1">
          <h2 className="text-sm uppercase text-nowrap text-black">
            PAYMENT METHOD
          </h2>
          <p className="text-sm text-grey">Paypal</p>
        </div>
      </div>
    </div>
  );
};

export default UserBenefitsComponent;
