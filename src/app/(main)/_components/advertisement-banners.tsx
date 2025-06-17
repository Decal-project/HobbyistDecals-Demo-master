"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import React, { useEffect, useCallback, useRef, useState } from "react";
import { advertisementBannerImageUrls } from "@/lib/constants";

const AdvertisementBannersComponent = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayDelay = 5000;
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi]
  );

  const startAutoplay = useCallback(() => {
    stopAutoplay(); // Avoid multiple intervals
    if (!emblaApi) return;

    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelay);
  }, [emblaApi]);

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    onSelect(); // Set initial index
    startAutoplay();

    return () => {
      stopAutoplay();
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, startAutoplay]);

  const handleDotClick = (index: number) => {
    stopAutoplay();
    scrollToIndex(index);
    setTimeout(() => startAutoplay(), 3000);
  };

  return (
    <div className="relative w-full overflow-hidden py-4 px-2">
      {/* Embla Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {advertisementBannerImageUrls.map((img, index) => (
            <div
              className="relative flex-[0_0_100%] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
              key={index}
            >
              <Image
                src={img}
                alt={`Ad ${index + 1}`}
                fill
                quality={100}
                className="object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {advertisementBannerImageUrls.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
              selectedIndex === index ? "bg-blue-600" : "bg-gray-400"
            }`}
            onClick={() => handleDotClick(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementBannersComponent;
