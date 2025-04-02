"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

type Props = {
  title: string;
  list: Array<{ img: string; title: string }>;
}

const DecalListCarousalComponent = ({ title, list } : Props) => {
  return (
    <div className="w-full min-h-[300px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
      <h2 className="capitalize text-xl text-black font-semibold">
        {title}
      </h2>
      <div className="w-full h-full flex flex-row items-center justify-center gap-3">
        <Carousel
          opts={{
            align: "start",
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full h-full"
        >
          <CarouselContent className="w-full h-full flex gap-4 mx-1">
            {list.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-1 md:basis-1/3 lg:basis-1/6 bg-transparent h-full border border-border rounded-xl overflow-clip !p-0"
              >
                <div className="h-[275px] w-full flex flex-col items-center justify-center gap-2 p-2">
                  <Image 
                    src={item.img}
                    alt={index.toString()}
                    width={0}
                    height={0}
                    unoptimized
                    quality={100}
                    draggable="false"
                    className="h-[175px] w-full object-cover"
                  />
                  <p className="flex-1 w-full text-base text-center leading-5 px-2 text-wrap line-clamp-3 truncate">
                    {item.title}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default DecalListCarousalComponent;
