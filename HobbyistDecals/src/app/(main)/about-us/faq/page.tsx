import FaqCustomize from "../_components/faq-customize-decals";
import FaqStock from "../_components/faq-stock-decals";

export default function FAQPage() {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-8 mt-8">
          FAQs About Our Customize Decals
        </h1>
        <FaqCustomize />
  
        <h1 className="text-3xl font-bold text-center mb-8">
          FAQs About Our Stock Decals
        </h1>
        <FaqStock />
      </div>
    );
  }
  
