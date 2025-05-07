'use client';

import React from 'react';

const content = [
  {
    title: 'OUR MISSION..',
    text: `At HobbyistDecals, our mission is to inspire creativity and elevate every project with our high-quality, custom decals. We are committed to providing exceptional products and services, ensuring that every decal meets the highest standards of precision and durability. We strive to be the go-to source for hobbyists and enthusiasts by offering innovative solutions and unparalleled customer support. Our goal is to make your creative vision a reality with ease and excellence.`
  },
  {
    title: 'OUR COMMITMENT..',
    text: `At HobbyistDecals, we are dedicated to provide you with top quality decals and exceptional customer service. Our expertise and state-of-the-art printing techniques ensure that your decals are not only stunning but also durable and easy to apply.

Thank you for choosing HobbyistDecals for all your decal needs. We look forward to help you bringing your creative projects to life!`
  },
  {
    title: 'OUR BENEFITS..',
    text: `At HobbyistDecals, we offer a range of benefits designed to meet your needs. All our decals are precut for easy application and printed with exceptional clarity and vibrant colors at 1440dpi using premium eco Solvent inks. We cater to all order sizes with no minimum quantity requirements and provide versatile media options, including Waterslide, White Vinyl, and Clear Vinyl. With over 10 years of industry experience, our team is committed to deliver high-quality products and outstanding customer service.`
  }
];

const MissionCommitmentBenefits = () => {
  return (
    <div className="w-full bg-white px-6 md:px-16 py-14">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300 gap-8">
        {content.map((section, idx) => (
          <div key={idx} className="md:px-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{section.title}</h2>
            <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed text-justify">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionCommitmentBenefits;
