'use client';

import React from 'react';
import BrowsePanel from '@/components/global/browse-panel';
import StatsAndServices from './_components/stats-and-services';
import MissionCommitmentBenefits from './_components/mission-benefits';
import WhyChooseUs from './_components/why-choose-us';

const DecalsPage = () => {
  return (
    <>
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="w-full mt-0">
        <img 
          src="/images/custom-decal-design-img-1.png" 
          alt="Custom Decal Banner"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="w-full px-6 py-10 bg-gray-50 text-gray-800">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900">
          Welcome to HobbyistDecals!
        </h1>
        <p className="text-lg mb-4 text-gray-700">
          At HobbyistDecals, we believe that every hobbyist deserves to see their creative visions come to life in the most vibrant and precise way possible. 
          Whether you’re a seasoned modeler or just starting out, our mission is to provide you with the highest quality decals that add the perfect finishing touch to your projects.
        </p>
        <p className="text-lg mb-4 text-gray-700">
          We transform your creative visions into vibrant, high-quality decals. Although we are a new brand, our team brings over 10 years of experience in the decal design and print industry.
        </p>

        <StatsAndServices />

        <MissionCommitmentBenefits />

        <WhyChooseUs />

        <div className="w-full mt-0">
        <img 
          src="/images/custom-decal-design-img-1.png" 
          alt="Custom Decal Banner"
          className="w-full h-auto object-cover"
        />
      </div>
      </div>

      

      
    </>
  );
};

export default DecalsPage;
