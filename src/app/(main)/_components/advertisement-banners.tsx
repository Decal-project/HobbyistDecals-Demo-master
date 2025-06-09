"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { advertisementBannerImageUrls } from "@/lib/constants";

const AdvertisementBannersComponent = () => {
  const image1 = advertisementBannerImageUrls[0];
  const image2 = advertisementBannerImageUrls[1];
  const innerImages = advertisementBannerImageUrls.slice(2);

  return (
    <div className="w-full flex justify-center py-0 px-2">
      <Carousel
        className="w-full max-w-[5000px]" // Increased width from screen-lg to custom large
        plugins={[Autoplay({ delay: 10000 })]}
      >
        <CarouselContent className="!m-0">
          {/* Outer Slide 1 */}
          <CarouselItem className="!p-0">
            <div className="relative w-full h-[500px]"> {/* Increased height too */}
              <Image
                src={image1}
                alt="Ad 1"
                fill
                quality={100}
                className="object-contain rounded-lg"
              />
            </div>
          </CarouselItem>

          {/* Inner Carousel */}
          <CarouselItem className="!p-0">
            <InnerBannerCarousel images={innerImages} />
          </CarouselItem>

          {/* Outer Slide 2 */}
          <CarouselItem className="!p-0">
            <div className="relative w-full h-[500px]">
              <Image
                src={image2}
                alt="Ad 2"
                fill
                quality={100}
                className="object-contain rounded-lg"
              />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};

const InnerBannerCarousel = ({ images }: { images: string[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);

    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex">
          {images.map((img, index) => (
            <div key={index} className="relative flex-none w-full h-[500px]">
              <Image
                src={img}
                alt={`Slide ${index}`}
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
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              selectedIndex === index ? "bg-blue-600" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementBannersComponent;
