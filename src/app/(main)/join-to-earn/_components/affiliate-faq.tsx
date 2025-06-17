"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is the Hobbyist Decals Affiliate Program?",
    answer:
      "The Hobbyist Decals Affiliate Program allows you to earn a 15% commission by promoting our custom decals. By sharing your unique affiliate link on your website, blog, or social media, you earn a commission on every sale made through your link.",
  },
  {
    question: "How do I join the Hobbyist Decals Affiliate Program?",
    answer:
      "Joining is simple! Sign up through our affiliate program portal. Once approved, you'll receive a unique affiliate link to start promoting our products.",
  },
  {
    question: "Who is eligible to join the affiliate program?",
    answer:
      "To be eligible, you must have a valid website, blog, or social media account with relevant content that aligns with our products.",
  },
  {
    question: "How much commission will I earn?",
    answer: "You will earn a 15% commission on the net sale amount, excluding taxes, shipping, and returns.",
  },
  {
    question: "When and how will I get paid?",
    answer:
      "Commissions are paid out monthly via PayPal. A minimum balance of $50 is required for payout.",
  },
  {
    question: "How can I promote Hobbyist Decals products?",
    answer:
      "You can promote using high-quality banners, text links, product reviews, and other promotional materials we provide. Misleading or deceptive marketing practices are strictly prohibited.",
  },
  {
    question: "How do I track my referrals and commissions?",
    answer:
      "Our advanced real-time tracking system ensures you can monitor your referrals and commissions effortlessly through your affiliate dashboard.",
  },
  {
    question: "What happens if a customer returns a product?",
    answer:
      "Commissions are only paid on net sales. If a customer returns a product, the commission for that sale will be deducted from your earnings.",
  },
  {
    question: "Can I share special offers with my audience?",
    answer: "Yes, as an affiliate, you’ll have access to exclusive offers, promotions, and discounts that you can share with your audience.",
  },
  {
    question: "Can my affiliate account be terminated?",
    answer:
      "Yes, we reserve the right to terminate any affiliate account that violates our terms and conditions or engages in fraudulent activities.",
  },
  {
    question: "Can the terms and conditions of the affiliate program change?",
    answer:
      "Hobbyist Decals reserves the right to modify the terms and conditions of the affiliate program at any time. We will notify you of any significant changes.",
  },
  {
    question: "Who can I contact for support?",
    answer: (
    <>
      Our dedicated support team is always available to assist you with any questions or issues you may have. You can contact us at <strong>info@hobbyistdecals.com</strong>.
    </>
  )
  },
];

export default function FAQAffiliate() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-100 py-10 px-4">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        FAQs About Custom Decal Design
      </h2>
      <div className="max-w-7xl w-full mx-auto space-y-3">
        {faqs.map((item, index) => (
          <div
            key={index}
            className={`border border-blue-400 ${
              activeIndex === index ? "rounded-3xl" : "rounded-3xl"
            } overflow-hidden`}
          >
            <div
              onClick={() => toggleAccordion(index)}
              className={`flex justify-between items-center px-8 py-4 cursor-pointer transition-colors duration-300 ${
                activeIndex === index
                  ? "bg-[#BEE2F3] text-black"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold text-base">
                Q: {item.question}
              </span>
              {activeIndex === index ? (
                <Minus className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5 text-black" />
              )}
            </div>
            {activeIndex === index && (
              <div className="bg-white px-8 py-5 text-center text-black border-t border-blue-400 rounded-b-3xl">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
