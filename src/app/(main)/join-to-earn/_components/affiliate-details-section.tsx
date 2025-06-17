import React from "react";

export default function AffiliateDetailsSection() {
  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
      {/* Terms & Conditions */}
      <div className="bg-white rounded-md shadow p-6">
        <h2 className="text-center text-black bg-[#BEE2F3] py-2 rounded-t-md font-bold text-xl">
          Terms & Conditions
        </h2>
        <ol className="list-decimal pl-5 pt-4 space-y-2 text-sm md:text-base">
          <li><strong>Eligibility:</strong> To join our affiliate program, you must have a valid website, blog, or social media account with relevant content.</li>
          <li><strong>Commission:</strong> Affiliates earn a 15% commission on the net sale amount, excluding taxes, shipping, and returns.</li>
          <li><strong>Payout:</strong> Commissions are paid out monthly via PayPal. A minimum balance of $50 is required for payout.</li>
          <li><strong>Promotion:</strong> Affiliates may promote using banners, text links, and product reviews. Any misleading or deceptive marketing practices are strictly prohibited.</li>
          <li><strong>Termination:</strong> We reserve the right to terminate any affiliate account that violates our terms and conditions or engages in fraudulent activities.</li>
          <li><strong>Modifications:</strong> Hobbyist Decals reserves the right to modify the terms and conditions of the affiliate program at any time.</li>
        </ol>
      </div>

      {/* Why Join */}
      <div className="bg-white rounded-md shadow p-6">
        <h2 className="text-center text-black bg-[#BEE2F3] py-2 rounded-t-md font-bold text-xl">
          Why Join Our Affiliate Program?
        </h2>
        <ul className="pt-4 space-y-3 text-sm md:text-base">
          <li><strong>High Commission:</strong> Earn 15% on every sale you refer.</li>
          <li><strong>Extensive Product Range:</strong> With over 500+ products, there’s something for every hobbyist.</li>
          <li><strong>Reliable Tracking:</strong> Our advanced tracking system ensures you get credited for every sale you refer.</li>
          <li><strong>Regular Payouts:</strong> Get paid promptly every month.</li>
          <li><strong>Exclusive Offers:</strong> Access to special promotions and discounts to share with your audience.</li>
        </ul>
      </div>
    </div>
  );
}
