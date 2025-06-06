"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How do I start a custom decal design order?",
    answer:
      "Contact us with your reference images and design ideas. Our team will guide you through the consultation and design process.",
  },
  {
    question: "What is the turnaround time for custom decal designs?",
    answer:
      "The turnaround time depends on the complexity of the design and the quantity ordered. We will provide an estimated timeline during the consultation.",
  },
  {
    question: "Can I make changes to the design after seeing the initial draft?",
    answer:
      "Yes, we welcome your feedback and will make necessary adjustments until you are satisfied with the final design.",
  },
  {
    question: "Are there any hidden fees in your pricing?",
    answer: "No, our pricing is transparent. We charge $25 per hour for custom decal design, and we will provide a detailed quote upfront.",
  },
  {
    question: "Do you offer international shipping for custom decals?",
    answer:
      "Yes, we offer international shipping. Shipping costs and delivery times vary based on the destination. Detailed shipping information will be provided at the time of order.",
  },
];

export default function FAQAccordion() {
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
