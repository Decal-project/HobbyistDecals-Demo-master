'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

type Feedback = {
  client_name: string;
  rating: number;
  review: string;
  scale_model_images: string[] | null;
};

const FeedbackCard = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setFeedbacks(data);
    };

    fetchFeedback();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth;

    if (direction === 'left') {
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const maxScrollLeft = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;

      if (sliderRef.current.scrollLeft >= maxScrollLeft) {
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [feedbacks]);

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold text-center mb-6">What Clients Say</h2>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-100 z-10"
          aria-label="Scroll Left"
        >
          &#8592;
        </button>

        <div
          ref={sliderRef}
          className="flex overflow-x-auto scroll-smooth scrollbar-hide space-x-6 px-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {feedbacks.map((item, index) => {
            const firstImage =
              Array.isArray(item.scale_model_images) && item.scale_model_images.length > 0
                ? item.scale_model_images[0]
                : '/uploads/j.jpg';

            return (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center p-4 text-center scroll-snap-align-start"
              >
                <div className="w-full h-48 relative mb-4">
                  <Image
                    src={firstImage}
                    alt={item.client_name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <h3 className="text-lg font-semibold">@{item.client_name}</h3>
                <div className="text-yellow-500 text-lg mb-2">
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
                <p className="text-gray-600 italic">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-100 z-10"
          aria-label="Scroll Right"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;
