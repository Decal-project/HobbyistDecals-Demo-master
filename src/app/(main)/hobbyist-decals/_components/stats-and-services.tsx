'use client';

import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import StatBox from './statbox';
import Link from 'next/link';

const StatsAndServices = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [activeTab, setActiveTab] = useState('Decal Design');

  const tabData: Record<string, { desc: string; enquiry: string; link: string }> = {
    'Decal Design': {
      desc: "Whether you need a custom design or have your own, we bring your ideas to life with precision and care.",
      enquiry: "For Enquiry (Decal Design)",
      link: "/custom-decal-design"
    },
    'Decal Print': {
      desc: "We use advanced printing technology to produce high-quality, durable decals tailored to your specifications.",
      enquiry: "For Enquiry (Decal Print)",
      link: "/decal-print"
    },
    'Stock Decals': {
      desc: "Explore our extensive collection of ready-to-use decals for various hobbies and interests.",
      enquiry: "Visit Hobbyist Decal Shop",
      link: "/decal-shop"
    }
  };

  return (
    <div ref={ref} className="w-full px-6 py-12 bg-gray-100 flex flex-col md:flex-row gap-8">
      <div className="grid grid-cols-2 gap-6 md:w-1/2">
        <StatBox title="UNIQUE PRODUCTS" end={3} inView={inView} />
        <StatBox title="HAPPY CUSTOMERS" end={2} inView={inView} />
        <StatBox title="FB FOLLOWERS" end={500} inView={inView} />
        <StatBox title="PROJECT COMPLETED" end={5} inView={inView} />
      </div>

      <div className="md:w-1/2">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services:</h2>

        <div className="flex border rounded overflow-hidden">
          {Object.keys(tabData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-[#16689A] text-white'
                  : 'bg-white text-gray-800 border-r hover:bg-blue-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded border text-gray-700">
          <p>{tabData[activeTab].desc}</p>
          <Link
            href={tabData[activeTab].link}
            className="mt-4 inline-block text-sm text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            {tabData[activeTab].enquiry}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatsAndServices;
