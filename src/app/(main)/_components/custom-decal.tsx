"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Decal = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  visible: boolean;
  order: number;
};

type RawDecal = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_visible: boolean;
  display_order: number;
};

const CustomDecal = () => {
  const [decals, setDecals] = useState<Decal[]>([]);
  const autoplay = useMemo(() => Autoplay({ delay: 5000, stopOnInteraction: false }), []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const fetchDecals = async () => {
      try {
        const res = await fetch("/api/gallery");
        const rawData: RawDecal[] = await res.json();

        const formatted: Decal[] = rawData.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          visible: item.is_visible,
          order: item.display_order,
        }));

        const filtered = formatted
          .filter((item) => item.visible)
          .sort((a, b) => a.order - b.order);

        setDecals(filtered);
      } catch (error) {
        console.error("Error fetching decals:", error);
      }
    };

    fetchDecals();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    emblaApi.on("pointerDown", autoplay.stop);
    emblaApi.on("pointerUp", autoplay.reset);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", autoplay.stop);
      emblaApi.off("pointerUp", autoplay.reset);
    };
  }, [emblaApi, autoplay]);

  if (!decals.length) {
    return (
      <div className="w-full min-h-[400px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
        <h2 className="capitalize text-xl text-black font-semibold">Custom Decal Design</h2>
        <p className="text-gray-500">No decals to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
      <h2 className="capitalize text-xl text-black font-semibold">Custom Decals We&rsquo;ve Created</h2>
      <div className="relative w-full flex items-center">
        {/* Left Arrow */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          className="absolute left-0 z-10 p-2 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100 disabled:opacity-30"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>

        {/* Carousel Viewport */}
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {decals.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 basis-1 md:basis-1/3 lg:basis-1/4 border border-gray-200 rounded-xl overflow-hidden p-2"
              >
                <div className="h-[275px] flex flex-col items-center justify-start gap-2">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={400}
                    height={200}
                    unoptimized
                    className="h-[175px] w-full object-cover rounded-md"
                  />
                  <h3 className="text-base font-semibold text-center px-2 uppercase">{item.title}</h3>
                  <p className="text-sm text-center text-gray-600 px-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          className="absolute right-0 z-10 p-2 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100 disabled:opacity-30"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};

export default CustomDecal;

