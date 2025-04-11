import Image from "next/image";
import React from "react";

export default function AffiliateInfo() {
  return (
    <div className="flex flex-col justify-between">
      <div>
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          Join the Hobbyist Decals Affiliate Program
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Are you passionate about scale models and looking to monetize your hobby? Join the Hobbyist Decals Affiliate Program and start earning a 15% commission on every sale you generate. By promoting our high-quality, custom-designed decals, you can turn your passion into profit. Our affiliate program is simple, rewarding, and perfect for bloggers, influencers, and website owners in the scale modeling community.
        </p>
        <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">
          How Our Affiliate Program Works
        </h2>
        <p className="text-lg text-gray-700">
          Becoming a Hobbyist Decals affiliate is simple and rewarding. After signing up, you’ll receive a unique affiliate link to share on your website, blog, or social media platforms. When a customer clicks your link and makes a purchase, you earn a 15% commission on that sale. Our real-time tracking ensures you can monitor your referrals and commissions effortlessly. We provide you with high-quality banners, images, and promotional materials to help you succeed. Our dedicated support team is always available to assist you with any questions or issues you may have. Start earning today by joining the Hobbyist Decals Affiliate Program and sharing your love for scale models with the world.
        </p>
      </div>

      <div className="mt-8">
        <Image
          src="/image.png"
          alt="Affiliate Program Visual"
          width={700}
          height={600}
          className="rounded-lg shadow object-cover w-full h-auto"
        />
      </div>
    </div>
  );
}
