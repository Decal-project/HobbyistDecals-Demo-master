import React from "react";
import GetAQuote from "./_components/get-a-quote";
import DesignProcess from './_components/design-process';
import ClientDecals from './_components/client-decals';
import GetStarted from './_components/design-today';
import FAQAccordion from "./_components/faq-about";
import BrowsePanel from "@/components/global/browse-panel";

const CustomDecalPage: React.FC = () => {
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
      <div className="flex flex-col md:flex-row justify-between items-start p-12 bg-gray-100">
        {/* Left Side */}
        <div className="md:w-3/5 pr-8 flex flex-col">
          <h1 className="text-4xl font-bold mb-6">Transform Your Ideas into Stunning Decals</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            At <span className="text-gray-400 font-semibold">HobbyistDecals</span>, we specialize in creating custom decals that perfectly match your vision.
            Whether you have a specific design in mind or need assistance bringing your ideas to life, our expert design team is here to help.
            With our custom decal design services, you can expect top-notch quality, personalized attention, and a seamless design process.
          </p>
          <h2 className="text-2xl font-bold mb-4">Affordable and Transparent Pricing</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Our custom decal design services start at just <strong>$25 per hour</strong>. We provide transparent pricing and detailed quotes so you know exactly what to expect.
            No hidden fees, just high-quality, personalized decal designs at a great value.
          </p>
          <div className="w-full md:h-[525px] h-64 bg-gray-300 flex items-center justify-center text-gray-500 rounded-lg mb-8">
            Image Placeholder
            <img
              src="/your-image-path/image.jpg"
              alt="Custom Decal Example"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#16689A] p-4">
              <h3 className="text-2xl font-semibold text-white text-center">
                Our custom decal design services are perfect for:
              </h3>
            </div>
            <div className="p-5 text-black">
              <p><strong>Businesses :</strong> Enhance your branding with custom logo decals, promotional materials, and product labels.</p>
              <p className="mt-4"><strong>Events and Organizations :</strong> Create unique decals for events, fundraisers, and organizational branding.</p>
              <p className="mt-4"><strong>Hobbyists and Collectors :</strong> Add a personal touch to your collections with custom-designed decals.</p>
              <p className="mt-4"><strong>Schools and Sports Teams :</strong> Design decals for team logos, mascots, and school events.</p>
              <p className="mt-4"><strong>Retailers and Distributors :</strong> Offer unique, custom decals to your customers.</p>
            </div>
          </div>
          <div className="mt-4">  
            <DesignProcess />
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-2/5 flex flex-col space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
            <GetAQuote />
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#16689A] p-6">
              <h3 className="text-2xl font-semibold text-white text-center">
                Why Choose HobbyistDecals for Custom Decals?
              </h3>
            </div>
            <div className="p-6 text-black">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Expert Design Team:</strong> Our designers have years of experience and a keen eye for detail. They are dedicated to creating decals that exceed your expectations.</li>
                <li><strong>High-Quality Materials:</strong> We use premium materials, including Waterslide (18 micron), White Vinyl (80gsm), and Clear Vinyl (80gsm), ensuring your decals are durable and vibrant.</li>
                <li><strong>Personalized Service:</strong> We pride ourselves on providing exceptional customer service. We work closely with you throughout the design process to ensure your complete satisfaction.</li>
                <li><strong>No Minimum Order:</strong> Whether you need a single custom decal or a large batch, we cater to orders of all sizes.</li>
                <li><strong>Advanced Printing Technology:</strong> Our state-of-the-art printing technology delivers sharp, vivid, and long-lasting decals. We use high-quality 1440dpi resolution and eco-solvent inks (CMYK, Lc, Lm, White, Metallic).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-white">
        <ClientDecals />
      </div>
      <div className="mt-5">
        <GetStarted />
      </div>
      <div className="w-full bg-gray-100 py-5 px-4 md:px-24">
        <FAQAccordion />
      </div>
    </>
  );
};

export default CustomDecalPage;
