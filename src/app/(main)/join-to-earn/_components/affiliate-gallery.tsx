"use client";
import React, { useState } from "react";
import DecalListCarousalComponent from "@/components/global/decals-list-carousal";

const galleryItems = [
  { img: "/path-to-img1.jpg", title: "Speed Cars Decals" },
  { img: "/path-to-img2.jpg", title: "Railway & Train Decals" },
  { img: "/path-to-img3.jpg", title: "Logo & Symbol Decals" },
  { img: "/path-to-img4.jpg", title: "Pinstriping Decals" },
];

const steps = [
  {
    title: "1. Sign Up:",
    content:
      "Fill out our affiliate program sign-up form.",
  },
  {
    title: "2. Promote:",
    content:
      "Share your unique affiliate links on your website, blog, or social media.",
  },
  {
    title: "3. Earn:",
    content:
      "Receive a 15% commission on every sale made through your links.",
  },
];

export default function AffiliateGallery() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
      {/* Custom Decal Design Process Stepper */}
      <div className="bg-white rounded-lg shadow-lg h-fit">
        <h2 className="bg-[#16689A] text-white text-center p-4 rounded-t-lg text-2xl font-semibold">
          Our Custom Decal Design Process
        </h2>
        <div className="flex flex-wrap border-b">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`flex-1 p-3 text-center text-sm md:text-base transition-all ${
                activeStep === index
                  ? "bg-white text-orange-600 font-semibold"
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

      {/* Decal Gallery Carousel */}
      <div className="w-full max-h-[350px] overflow-hidden">
        <DecalListCarousalComponent
          title="Hobbyist Decals on Work"
          list={galleryItems}
        />
      </div>
    </div>
  );
}
