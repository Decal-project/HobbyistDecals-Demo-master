"use client";

import { Info } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StraightenIcon from "@mui/icons-material/Straighten";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { Button } from "@/components/ui/button";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const ProductDetailsComponent = () => {
  const [pinCode, setPinCode] = useState<number>();
  const [isCheckDisabled, setIsCheckDisabled] = useState<boolean>(true);

  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: "center center",
    transform: "scale(1)",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)", // Adjust the zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  function checkPinCode(value: string): void {
    if (value.length < 6) {
      setIsCheckDisabled(true);
    } else if (value.toString().length == 6) {
      setIsCheckDisabled(false);
    } else {
      return;
    }
    setPinCode(parseInt(value, 10));
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-white py-4">
      {}
      <div className="w-[98%] h-full flex flex-row items-stretch justify-center gap-6">
        <div className="w-[35%] flex flex-col items-center justify-center">
          <div
            className="relative w-full h-[85%] flex items-center justify-center overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src="https://hobbyistdecals.com/wp-content/uploads/2024/07/HD000755-S025_OPhee-Trailer-Decals.png"
              alt="img"
              fill
              quality={100}
              unoptimized
              draggable="false"
              className="object-cover transition-transform duration-300"
              style={{
                ...zoomStyle,
              }}
            />
          </div>

          {/* Thumbnails (Optional) */}
          <div className="flex-1 w-full flex flex-row items-center justify-center gap-4">
            <div className="flex-1 bg-transparent h-16 flex items-center justify-center">
              <Button className="w-full h-[90%] rounded-xl overflow-hidden bg-orange transform transition-all duration-300 hover:bg-orange-hover capitalize text-xl tracking-wider text-white font-semibold flex flex-row items-center justify-center gap-4">
                <FlashOnOutlinedIcon className="!h-6 !w-6 text-white" />
                <span>add to cart</span>
              </Button>
            </div>
            <div className="flex-1 bg-transparent h-16 flex items-center justify-center">
              <Button className="w-full h-[90%] rounded-xl overflow-hidden bg-red transform transition-all duration-300 hover:bg-red-hover capitalize text-xl tracking-wider text-white font-semibold flex flex-row items-center justify-center gap-4">
                <ShoppingCartIcon className="!h-6 !w-6 text-white" />
                <span>buy now</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center gap-8">
          <div className="w-full flex flex-col items-start justify-center gap-2">
            <p className="text-grey text-sm font-semibold tracking-wider uppercase text-nowrap">
              water
            </p>
            <p className="text-black text-nowrap capitalize text-lg">
              O’Phee Trailer Decals – 1/25 – Water Decal
            </p>
            <p className="text-sm text-green">Special price</p>
            <div className="flex flex-row items-center justify-center gap-4">
              <p className="text-3xl font-semibold text-black">$19.99</p>
              <p className="line-through text-grey text-lg">$39.99</p>
              <p className="text-green text-lg">58% off</p>
              <Info className="w-5 h-5 text-grey" />
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-row items-center justify-center rounded-full bg-green px-2  gap-1">
                <p className="text-base text-white font-semibold">3.9</p>
                <StarIcon className="!h-[15px] !w-[15px] text-white" />
              </div>
              <p className="text-base text-grey">39 ratings and 1 reviews</p>
            </div>
          </div>
          <div className="w-full flex flex-row items-start justify-start gap-[4rem]">
            <p className="text-sm font-semibold text-grey capitalize">size</p>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/25</p>
              </div>
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/30</p>
              </div>
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/35</p>
              </div>
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/40</p>
              </div>
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/45</p>
              </div>
              <div className="h-[40px] w-[50px] border border-border flex items-center justify-center  cursor-pointer">
                <p className="uppercase text-[18px] font-semibold">1/50</p>
              </div>
              <div className="h-[40px] w-[50px] border border-dashed border-border flex items-center justify-center cursor-not-allowed">
                <p className="uppercase text-[18px] font-semibold text-border">
                  1/60
                </p>
              </div>
              <div className="h-[40px] w-[50px] border border-dashed border-border flex items-center justify-center cursor-not-allowed">
                <p className="uppercase text-[18px] font-semibold text-border">
                  1/75
                </p>
              </div>
              <div className="h-[40px] w-[50px] border border-dashed border-border flex items-center justify-center cursor-not-allowed">
                <p className="uppercase text-[18px] font-semibold text-border">
                  1/100
                </p>
              </div>
            </div>
            <div className="self-center flex flex-row items-center justify-center gap-2 cursor-pointer">
              <p className="text-sm text-link capitalize font-semibold">
                size chart
              </p>
              <StraightenIcon className="!w-6 !h-6 text-link" />
            </div>
          </div>
          <div className="w-full flex flex-col items-start justify-center gap-3">
            <p className="text-black capitalize tracking-wide">
              available offers
            </p>
            <div className="flex flex-row items-center justify-center gap-2">
              <LocalOfferIcon className="!w-5 !h-5 text-green" />
              <p className="text-sm text-black tracking-wide">
                <span className="capitalize font-semibold">bank offer </span>
                5% Unlimited Cashback on Axis Bank Credit Card{" "}
                <span className="uppercase text-link cursor-pointer hover:underline underline-offset-2">
                  t&c
                </span>
              </p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
              <LocalOfferIcon className="!w-5 !h-5 text-green" />
              <p className="text-sm text-black tracking-wide">
                <span className="capitalize font-semibold">bank offer </span>
                12% off up to ₹1,000 on HDFC Bank Pixel Credit Card EMI on 3
                months tenure. Min. Txn Value: ₹7,500{" "}
                <span className="uppercase text-link cursor-pointer hover:underline underline-offset-2">
                  t&c
                </span>
              </p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
              <LocalOfferIcon className="!w-5 !h-5 text-green" />
              <p className="text-sm text-black tracking-wide">
                <span className="capitalize font-semibold">bank offer </span>
                12% off up to ₹1,500 on HDFC Bank Pixel Credit Card EMI on 6m
                and 9m tenure. Min Txn Value: ₹7,500{" "}
                <span className="uppercase text-link cursor-pointer hover:underline underline-offset-2">
                  t&c
                </span>
              </p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
              <LocalOfferIcon className="!w-5 !h-5 text-green" />
              <p className="text-sm text-black tracking-wide">
                <span className="capitalize font-semibold">bank offer </span>
                Get extra 8% off (price inclusive of cashback/coupon){" "}
                <span className="uppercase text-link cursor-pointer hover:underline underline-offset-2">
                  t&c
                </span>
              </p>
            </div>
            <p className="text-link text-sm tracking-wide cursor-pointer hover:underline underline-offset-2">
              +11 more offers
            </p>
          </div>
          <div
            className="w-full flex flex-row items-start
           justify-center gap-4"
          >
            <div className="w-full flex flex-col items-start justify-center gap-6">
              <div className="w-full flex flex-row items-center justify-start gap-1">
                <LocationOnIcon className="text-link !w-5 !h-5" />
                <p className="capitalize text-grey text-sm font-semibold">
                  deliver to
                </p>
              </div>
              <div className="relative flex items-center justify-start gap-2">
                <input
                  title="pin code"
                  type="number"
                  placeholder="Enter delivery pincode"
                  className="border-none outline-none text-sm placeholder:text-sm focus:outline-none focus:border-none tracking-wider"
                  value={pinCode ? pinCode : ""}
                  onChange={(e) => checkPinCode(e.target.value)}
                />
                <p
                  className={`capitalize text-sm text-grey ${
                    isCheckDisabled
                      ? "cursor-not-allowed"
                      : "cursor-pointer text-link"
                  }`}
                >
                  check
                </p>
                <div className="absolute left-0 right-0 -bottom-1 h-[1px] bg-link"></div>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <div className="flex flex-row items-center justify-center gap-2">
                  <p className="text-sm text-black font-semibold text-nowrap">
                    Delivery by 26 Dec, Thursday
                  </p>
                  <span className="text-grey font-semibold">|</span>
                  <span className="capitalize text-green font-semibold">
                    free
                  </span>
                  <span className="capitalize text-grey line-through font-semibold">
                    $10
                  </span>
                  <HelpOutlineOutlinedIcon className="!w-5 !h-5 text-grey" />
                </div>
                <p className="text-xs">if ordered before 3:59 PM</p>
                <p className="capitalize text-blue text-sm font-semibold">
                  view details
                </p>
              </div>
            </div>
            <div className="w-full flex flex-col items-start justify-center gap-4">
              <div className="w-full flex flex-row items-center justify-start gap-12">
                <p className="text-grey font-semibold text-sm capitalize">
                  services
                </p>
                <div className="flex flex-row items-center justify-center gap-2">
                  <AttachMoneyIcon className="text-white bg-link rounded-full !h-4 !w-4" />
                  <span className="text-black text-sm">
                    Cash on Delivery Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-grey"></div>
          <div className="w-full flex flex-row items-center justify-between gap-4">
            <h2 className="text-xl text-black capitalize font-semibold">
              ratings and reviews
            </h2>
            <div className="flex flex-row items-center justify-center gap-2">
              <div className="flex flex-row items-center justify-center gap-1 bg-green rounded-full px-2 py-1">
                <p className="font-semibold text-sm capitalize text-white">
                  4.71
                </p>
                <StarIcon className="!w-4 !h-4 text-white" />
              </div>
              <p className="text-grey text-base">
                7,021 ratings and 282 reviews
              </p>
            </div>
            <Button className="text-white bg-link capitalize transform transition-all duration-300 hover:bg-blue-hover text-sm">
              rate product
            </Button>
          </div>
          <div className="w-full h-[1px] bg-grey"></div>
        </div>
      </div>
      <div className="w-[95%] h-full flex flex-col items-center justify-center gap-6">
        <div className="w-full flex flex-col items-start justify-center gap-4">
          <h4 className="text-xl font-semibold capitalize">about us</h4>
          <div className="w-full flex flex-col items-center justify-center gap-3">
            <p className="w-full text-start text-base leading-6">
              <span className="font-semibold">
                Elevate your 1/25 scale O’Phee Trailer models with our
                meticulously crafted water decals!{" "}
              </span>
              More than just stickers, these precision-engineered decals are a
              modeler’s dream, offering an unparalleled level of detail, ease of
              use, and lasting durability. Designed for the passionate
              enthusiast and collector, these decals imbue your miniature
              trailers with the captivating authenticity that truck aficionados
              crave.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Immerse Yourself in Unmatched Detail:
            </h6>
            <p className="w-full text-start text-base leading-6">
              Forget generic, mass-produced decals that fail to capture the
              essence of a real O’Phee Trailer.
              <span className="font-semibold">Our decals boast:</span>
            </p>
            <ol className="w-full list-disc pl-12 flex flex-col items-start justify-center leading-6">
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Crisp, high-resolution graphics{" "}
                </span>
                replicating the official O’Phee Trailer branding and markings
                with perfect accuracy.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Color-matching precision </span>
                ensuring a true-to-life representation of the O’Phee Trailer
                livery.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Precut designs </span>
                for easy application and a seamless fit on your model.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Exceptional clarity and vibrant colors{" "}
                </span>
                thanks to our 1440 dpi printing process.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Full opacity </span>
                for a realistic, professional finish that complements your
                model.
              </li>
            </ol>
            <p className="w-full text-start text-base leading-6">
              With these decals, you’ll transform your models from ordinary
              replicas into stunning centerpieces, showcasing your dedication to
              detail and your passion for O’Phee Trailers.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Effortless Application, Flawless Results:
            </h6>
            <p className="w-full text-start text-base leading-6">
              Our decals are crafted with user-friendliness in mind, making them
              a breeze to apply:
            </p>
            <ol className="w-full pl-12 list-disc flex flex-col items-start justify-center leading-6">
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Pre-cut designs </span>
                ensure a perfect fit, eliminating the need for tedious trimming.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  High-quality water slide material{" "}
                </span>
                allows for easy application and conforms to the contours of your
                model.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Exceptional adherence </span>
                ensures a smooth, bubble-free finish, leaving you with a
                professional-looking result.
              </li>
            </ol>
            <p className="w-full text-start text-base leading-6">
              Focus on creating your masterpiece, and let our decals provide the
              perfect finishing touch.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Durability Built to Last:
            </h6>
            <p className="w-full text-start text-base leading-6">
              Our meticulous attention to detail extends beyond aesthetics.
              These decals are engineered for longevity:
            </p>
            <ol className="w-full pl-12 list-disc flex flex-col items-start justify-center leading-6">
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Treated with a special protective coating{" "}
                </span>
                , they resist fading, cracking, and yellowing over time.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Whether displayed on a shelf or showcased at exhibitions{" "}
                </span>
                , these decals will maintain their vibrancy and crispness for
                years to come.
              </li>
            </ol>
            <p className="w-full text-start text-base leading-6">
              Invest in decals that stand the test of time, just like the O’Phee
              Trailer brand.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Unleash Your Creative Vision:
            </h6>
            <p className="w-full text-start text-base leading-6">
              These decals are more than just reproductions; they’re a
              springboard for your creative vision:
            </p>
            <ol className="w-full pl-12 list-disc flex flex-col items-start justify-center leading-6">
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Recreate a specific O’Phee Trailer model{" "}
                </span>
                from history or design a custom livery that reflects your unique
                style.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">Add weathering effects </span>
                to create a realistic, used look that captures the essence of a
                working trailer.
              </li>
              <li className="w-full text-start text-base leading-6">
                <span className="font-semibold">
                  Combine these decals with other accessories{" "}
                </span>
                to further customize your model and make it truly one-of-a-kind.
              </li>
            </ol>
            <p className="w-full text-start text-base leading-6">
              With our wide range of decal options, you can personalize your
              models to your heart’s content.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Join a Community of Passionate Modelers:
            </h6>
            <p className="w-full text-start text-base leading-6">
              Hobbyist Decals is more than just a decal company; it’s a
              community of passionate modelers and truck enthusiasts who share
              your love for the hobby. We offer:
            </p>
            <ol className="w-full pl-12 list-disc flex flex-col items-start justify-center leading-6">
              <li className="w-full text-start text-base leading-6">
                Helpful tutorials on applying decals and building truck models.
              </li>
              <li className="w-full text-start text-base leading-6">
                Insights and stories about the trucking industry, including the
                history of O’Phee Trailers.
              </li>
              <li className="w-full text-start text-base leading-6">
                A forum where you can connect with fellow modelers, share your
                creations, and exchange tips.
              </li>
            </ol>
            <p className="w-full text-start text-base leading-6">
              Become part of the community and elevate your modeling experience.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Elevate Your O’Phee Trailer Models Today:
            </h6>
            <p className="w-full text-start text-base leading-6">
              Don’t settle for ordinary models. Invest in the details that make
              a difference.
              <span className="font-semibold">
                With Hobbyist Decals’ O’Phee Trailer decals, you’ll transform
                your models from simple replicas into breathtaking miniature
                masterpieces.
              </span>
              Explore our extensive selection, unleash your creative vision, and
              embark on a journey of passion for trucking and model building.
            </p>
            <h6 className="w-full text-start text-lg font-semibold capitalize">
              Order your O’Phee Trailer decals today and elevate your
              collection!
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsComponent;
