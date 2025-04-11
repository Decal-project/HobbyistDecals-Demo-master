import React from "react";
import AffiliateInfo from "./_components/affiliate-info";
import AffiliateLogin from "./_components/affiliate-login";
import AffiliateWelcomeBox from "./_components/affiliate-welcome-box";
import AffiliateDetailsSection from "./_components/affiliate-details-section";
import AffiliateGallery from "./_components/affiliate-gallery";
import FAQAffiliate from "./_components/affiliate-faq";
import BrowsePanel from "@/components/global/browse-panel";

export default function AffiliatePage() {
  return (
    <>
        <div className="w-full">
          <BrowsePanel />
        </div>
        <div className="w-full mt-0">
            <img 
            src="/images/custom-decal-design-img-1.png" 
            className="w-full h-auto object-cover"
            />
        </div>
        <div className="min-h-screen bg-gray-100 p-6 md:p-12 space-y-10">
        {/* Info + Login */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <AffiliateInfo />
            <AffiliateLogin />
        </div>

        {/* Welcome Box */}
        <div className="max-w-5xl mx-auto">
            <AffiliateWelcomeBox />
        </div>

        {/* Terms & Why Join */}
        <AffiliateDetailsSection />

        {/* How It Works & Carousel */}
        <AffiliateGallery />

        <div className="w-full bg-gray-100 py-5 px-4 md:px-24 mt-0">
            <FAQAffiliate />
        </div>
        </div>
    </>
  );
}
