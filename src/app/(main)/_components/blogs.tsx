import { blogs } from "@/lib/constants";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

const BlogsComponent = () => {
  return (
    <div className="w-full min-h-[400px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
      <h2 className="capitalize text-xl text-black font-semibold">
        Latest Blogs
      </h2>
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((item, index) => (
          <Link
            href={item.href}
            key={index}
            className="h-[325px] w-full flex flex-col items-center justify-center bg-primary overflow-hidden rounded-xl"
          >
            <Image
              src={item.img}
              alt={index.toString()}
              width={0}
              height={0}
              unoptimized
              quality={100}
              draggable="false"
              className="h-[200px] w-full object-cover flex-shrink-0"
            />
            <div className="flex-1 w-full flex flex-col items-start justify-between gap-4 px-3 py-4">
              <p className="w-full text-base text-start leading-6 line-clamp-2 truncate">
                {item.title}
              </p>
              <div className="w-full flex flex-row items-center justify-between gap-2">
                <div className="flex flex-row items-center gap-1">
                  <Calendar className="!h-5 !w-5 text-grey" />
                  <p className="text-sm text-grey capitalize">
                    November 13, 2024
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <Clock className="!h-5 !w-5 text-grey" />
                  <p className="text-sm text-grey capitalize">6 min read</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogsComponent;
