"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoriesList } from "@/lib/constants";

const steps = [
  { title: "1. Sign Up:", content: "Fill out our affiliate program sign-up form." },
  { title: "2. Promote:", content: "Share your unique affiliate links on your website, blog, or social media." },
  { title: "3. Earn:", content: "Receive a 15% commission on every sale made through your links." },
];

export default function AffiliateGallery() {
  const [activeStep, setActiveStep] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000 })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
      {/* Stepper */}
      <div className="bg-white rounded-lg shadow-lg h-fit">
        <h2 className="bg-[#BEE2F3] text-black text-center p-4 rounded-t-lg text-2xl font-semibold">
          Our Custom Decal Design Process
        </h2>
        <div className="flex flex-wrap border-b">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`flex-1 p-3 text-center text-sm md:text-base transition-all ${
                activeStep === index
                  ? "bg-white text-[#16689A] font-semibold"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              <strong>{step.title}</strong>
            </button>
          ))}
        </div>
        <div className="p-6 text-gray-700 text-sm md:text-base">
          {steps[activeStep].content}
        </div>
      </div>

      {/* Compact Carousel */}
      <div className="relative bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-center mb-2">Hobbyist Decals on Work</h3>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {categoriesList.map((item, idx) => (
              <div
                className="flex-[0_0_33%] sm:flex-[0_0_25%] md:flex-[0_0_20%] p-1 flex justify-center items-center"
                key={idx}
              >
                <Image
                  src={item.img || "/placeholder.png"}
                  alt={item.title || `Decal ${idx + 1}`}
                  width={100}
                  height={80}
                  className="rounded-md object-contain border"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-1 rounded-full shadow hover:bg-gray-100 z-10"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-1 rounded-full shadow hover:bg-gray-100 z-10"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
