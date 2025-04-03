"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

const FaqStock = () => {
  const faqs = [
    {
      question: "What are stock decals?",
      answer:
        "Stock decals are pre-designed decals available for immediate purchase. They cover a wide range of themes and styles, perfect for various hobbies and projects without the need for customization.",
    },
    {
      question: "What themes and designs are available in your stock decals?",
      answer:
        "Our stock decals include a diverse selection of themes such as automotive, aviation, marine, sci-fi, fantasy, and many more. We continuously update our collection to include the latest trends and popular designs.",
    },
    {
      question: "What sizes do your stock decals come in?",
      answer:
        "Our stock decals are available in various sizes to fit different projects and scales. Each product page provides detailed information about the available sizes.",
    },
    {
      question: "Are your stock decals precut?",
      answer: "Yes, all our stock decals are precut for easy application, ensuring a clean and professional finish without the need for additional trimming.",
    },
    {
      question: "What materials are used for your stock decals?",
      answer:
        "Our stock decals are made from high-quality materials, including Waterslide (18 micron), White Vinyl (80gsm), and Clear Vinyl (80gsm). Each material is chosen for its durability and clarity.",
    },
    {
      question: "How do I apply stock decals?",
      answer:
        "The application process varies slightly depending on the material. For waterslide decals, soak them in water before sliding them onto your surface. Vinyl decals can be peeled and stuck directly. Detailed instructions are provided with each purchase to ensure proper application.",
    },
    {
      question: "Can I order stock decals in bulk?",
      answer:
        "Yes, we offer bulk purchasing options for stock decals. If you need a large quantity for a project or resale, please contact us for more details and pricing.",
    },
    {
      question: "Do you offer international shipping for stock decals?",
      answer:
        "Yes, we ship our stock decals worldwide. Shipping costs and delivery times vary based on the destination. Detailed shipping information is available at checkout.",
    },
    {
      question: "How do I care for my decals after application?",
      answer:
        "To ensure longevity, apply decals to clean, dry surfaces and consider sealing them with a clear coat or varnish. This will protect them from wear and environmental factors.",
    },
    {
      question: "What is your return policy for stock decals?",
      answer:
        "We strive for customer satisfaction. If you are not happy with your purchase, please contact us within 7 days of receiving your order. We do not accept returns, but we can reship the decals after fixing the issue.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-blue-50 py-20 flex flex-col items-center">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white w-[90%] md:w-[70%] lg:w-[60%] rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-lg border border-blue-300"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex justify-between items-center p-6 cursor-pointer focus:outline-none bg-blue-100 hover:bg-blue-200 transition-colors rounded-lg"
          >
            <span className="font-semibold text-lg text-blue-900">{`Q${index + 1}: ${faq.question}`}</span>
            {activeIndex === index ? (
              <ChevronDown className="h-6 w-6 text-blue-700 transition-transform duration-200 transform rotate-180" />
            ) : (
              <ChevronRight className="h-6 w-6 text-blue-700 transition-transform duration-200" />
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-[500px] opacity-100 py-6 bg-white' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-6 pb-6 text-blue-800 text-lg leading-relaxed">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqStock;
