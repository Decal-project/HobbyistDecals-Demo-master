"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

const FaqCustomize = () => {
  const faqs = [
    {
      question: "What types of decals do you offer?",
      answer:
        "At HobbyistDecals, we offer custom-designed decals, high-quality decal prints, and a wide range of stock decals. Our products are perfect for various applications, including scale models, crafts, and custom projects.",
    },
    {
      question: "What materials are your decals made from?",
      answer:
        "We use three premium media types for our decals: Waterslide (18 micron), White Vinyl (80gsm), and Clear Vinyl (80gsm). Each material is chosen for its durability and quality, ensuring vibrant and long-lasting decals.",
    },
    {
      question: "How are your decals printed?",
      answer:
        "Our decals are printed at an impressive 1440dpi resolution using eco Solvent inks (CMYK, Lc, Lm, White, Metallic). This ensures exceptional clarity, vibrant colors, and durability.",
    },
    {
      question: "Are your decals precut?",
      answer: "Yes, all our decals are precut for easy application. This saves you time and ensures a professional finish every time.",
    },
    {
      question: "Is there a minimum order quantity for decals?",
      answer:
        "No, we do not have a minimum order quantity. Whether you need just one decal or a large batch, we can accommodate your needs.",
    },
    {
        question: "How do I apply waterslide decals?",
        answer:
        "Applying waterslide decals is easy. Simply soak the decal in water for a few seconds, slide it onto your surface, position it as desired, and then let it dry. For best results, follow the detailed instructions provided with your order.",
    },
    {
        question: "Can I use your decals on different surfaces?",
        answer:
        "Yes, our decals are versatile and can be applied to a variety of surfaces, including plastic, glass, metal, and wood. Ensure the surface is clean and smooth for optimal adhesion.",
    },
    {
        question: "How do I ensure the longevity of my decals?",
        answer:
        "To ensure your decals last, apply them to clean, dry surfaces and consider sealing them with a clear coat or varnish. This will protect them from wear and tear, and environmental factors.",
    },
    {
        question: "Can I create custom designs with HobbyistDecals?",
        answer:
        "Absolutely! We offer custom decal design services to bring your unique ideas to life. Provide us with your design or work with our team to create something special.",
    },
    {
        question: "How can I share my projects using HobbyistDecals?",
        answer:
        "We love seeing our decals in action! Share your projects on social media using the hashtag #HobbyistDecals, and you might be featured in our gallery. Follow us on Facebook, Instagram, and Twitter to stay connected.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 py-10 flex flex-col items-center">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white w-[90%] md:w-[85%] lg:w-[80%] rounded-lg shadow mb-4"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex justify-between items-center p-6" // Increased padding for height
          >
            <span className="font-semibold text-lg">{`Q${index + 1}: ${faq.question}`}</span>
            {activeIndex === index ? (
              <ChevronDown className="h-6 w-6" /> // Slightly increased icon size
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </button>

          {activeIndex === index && (
            <div className="px-6 pb-6 text-gray-700 text-base leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqCustomize;
