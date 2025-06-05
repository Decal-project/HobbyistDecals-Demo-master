"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  title: string;
  list: Array<{ img: string; title: string }>;
};

const DecalListCarousalComponent = ({ title, list }: Props) => {
  const autoplay = useMemo(() => Autoplay({ delay: 5000, stopOnInteraction: false }), []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  return (
    <div className="w-full min-h-[300px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
      <h2 className="capitalize text-xl text-black font-semibold">{title}</h2>
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

        {/* Carousel viewport */}
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {list.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 basis-1 md:basis-1/3 lg:basis-1/6 border border-border rounded-xl overflow-hidden p-2"
              >
                <div className="h-[275px] flex flex-col items-center justify-center gap-2">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={0}
                    height={0}
                    unoptimized
                    quality={100}
                    draggable={false}
                    className="h-[175px] w-full object-cover"
                  />
                  <Link
                    href={`/category/${encodeURIComponent(item.title)}`}
                    className="w-full text-base text-center leading-5 px-2 whitespace-normal text-blue-600 hover:underline"
>
                    {item.title}
                  </Link>
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

export default DecalListCarousalComponent;
