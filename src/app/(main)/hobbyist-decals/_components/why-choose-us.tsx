'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const benefits = [
  {
    title: 'Precut Perfection',
    description: 'All our decals come precut for easy application.',
  },
  {
    title: 'Unmatched Quality',
    description: 'We use the latest technology to print at an impressive 1440dpi, ensuring crisp, clear, and vibrant decals.',
  },
  {
    title: 'No Minimum Quantity',
    description: 'Whether you need one decal or a hundred, we\'ve got you covered.',
  },
  {
    title: 'Advanced Inks',
    description: 'We utilize Eco Solvent ink (CMYK, Lc, Lm, White, Metallic) for durable, high-quality results.',
  },
  {
    title: 'Versatile Media',
    description: 'Choose from Waterslide media, White Vinyl or Clear Vinyl to suit your specific project needs.',
  },
];

export default function WhyChooseUs() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // <-- all closed initially

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-100 py-10 px-4">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        Why Choose HobbyistDecals?
      </h2>
      <div className="max-w-7xl w-full mx-auto space-y-3">
        {benefits.map((item, index) => (
          <div
            key={index}
            className="border border-blue-400 rounded-3xl overflow-hidden"
          >
            <div
              onClick={() => toggleAccordion(index)}
              className={`flex justify-between items-center px-8 py-4 cursor-pointer transition-colors duration-300 ${
                activeIndex === index
                  ? 'bg-[#16689A] text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold text-base">
                {item.title}
              </span>
              {activeIndex === index ? (
                <Minus className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5 text-black" />
              )}
            </div>
            {activeIndex === index && (
              <div className="bg-white px-8 py-5 text-center text-black border-t border-blue-400 rounded-b-3xl">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
