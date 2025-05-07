"use client";
import React, { useState } from "react";
import BrowsePanel from "@/components/global/browse-panel";

const BulkDecals = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    subject: "",
    qty: "",
    message: "",
    file: null as File | null,
  });

  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const steps = [
    { id: 1, title: "Contact Us", content: "Reach out to us with your requirements by email 'info@hobbydecals.com' or Fill up the Form. Our team is here to assist you with the design and planning process." },
    { id: 2, title: "Design Consultation", content: "Our team will work with you to refine your decal designs and ensure they meet your expectations before production." },
    { id: 3, title: "Approval and Production", content: "Once you approve the final design, we proceed with high-quality production of your decals." },
    { id: 4, title: "Delivery", content: "Your decals will be packaged securely and shipped to your location with tracking information provided." },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      setFormData({ ...formData, file: target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
    
      const res = await fetch("/api/quote", {
        method: "POST",
        body: form,
      });
    
      if (res.ok) {
        alert("Quote submitted successfully!");
        setFormData({
          firstName: "",
          phone: "",
          email: "",
          subject: "",
          qty: "",
          message: "",
          file: null,
        });
      
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };      

  return (
    <div className="font-sans text-gray-800">
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
        {/* Left Section */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Customized Bulk Decals for Your Needs</h1>
          <p className="text-base mb-4 leading-relaxed">
            At <span className="text-blue-600 font-semibold">HobbyistDecals</span>, we understand that sometimes you need more than just a few decals.
            We offer substantial discounts of up to 40% on bulk decal orders. This makes it more affordable to get the high-quality decals you need for your projects. A one-time decal design charge may apply depending on the quantity and complexity of the design.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Exclusive Bulk Order Discounts</h2>
          <p className="text-base mb-4 leading-relaxed">
            We offer discounts of up to <span className="font-bold">40%</span> on bulk decal orders. A one-time decal design charge may apply depending on the quantity and complexity.
          </p>

          <img src="/images/home-top-picks-advertisement.png" alt="Bulk Decals" className="w-full rounded-lg shadow-lg mb-6 w-[600px] h-[390px]" />

          <div className="bg-[#16689A] text-white text-base font-semibold p-3 text-center rounded-xl">
            Our bulk decal services are ideal for:
          </div>
          <div className="border border-gray-300 p-4 bg-white rounded-xl text-sm leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Businesses:</strong> Perfect for branding, promotional materials, and product labeling.</li>
              <li><strong>Events and Organizations:</strong> Custom decals for events, fundraisers, and organizational branding.</li>
              <li><strong>Hobbyists and Collectors:</strong> Enhance your collections with custom-designed decals.</li>
              <li><strong>Schools and Sports Teams:</strong> Custom decals for team logos, mascots, and school events.</li>
              <li><strong>Retailers and Distributors:</strong> Stock up on popular designs to sell or distribute.</li>
            </ul>
          </div>

          {/* How to Order Bulk Decals Section */}
          <div className="bg-[#16689A] text-white text-base font-semibold p-3 mt-8 text-center rounded-xl">
            How to Order Bulk Decals?
          </div>
          <div className="bg-gray-100 flex flex-wrap md:flex-nowrap border-b border-gray-300 rounded-xl mt-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`flex-1 text-center py-3 px-4 text-sm font-semibold transition ${
                  activeTab === step.id
                    ? "text-orange-600 border-b-4 border-orange-500 bg-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {step.id}. {step.title}
              </button>
            ))}
          </div>
          <div className="p-5 border border-gray-300 bg-white rounded-xl">
            <p className="text-sm leading-relaxed">{steps.find((step) => step.id === activeTab)?.content}</p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex flex-col items-center w-full">
          <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Get a Quote:</h2>
            <p className="text-base text-center mb-4">
              Enhance your projects with premium bulk decals <span className="font-semibold text-blue-600">HobbyistDecals</span> today!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
              <input
  type="text"
  name="firstName"
  placeholder="First Name *"
  required
  className="p-2 border rounded w-full"
  value={formData.firstName}
  onChange={handleChange}
/>

                <input type="text" name="phone" placeholder="Phone" className="p-2 border rounded w-full" value={formData.phone} onChange={handleChange} />
              </div>
              <input type="email" name="email" placeholder="Email Address *" required className="p-2 border rounded w-full"value={formData.email} onChange={handleChange} />
              <input type="text" name="subject" placeholder="Subject" className="p-2 border rounded w-full" value={formData.subject} onChange={handleChange} />
              <input type="number" name="qty" placeholder="Quantity" className="p-2 border rounded w-full" value={formData.qty} onChange={handleChange} />
              <textarea name="message" placeholder="Message *" required className="p-2 border rounded w-full h-28" value={formData.message} onChange={handleChange}></textarea>
              <div>
                <label className="block mb-2 text-sm font-medium">File Upload</label>
                <input
  ref={fileInputRef}
  type="file"
  onChange={handleFileChange}
  className="w-full border rounded p-2"
/>

                <p className="text-xs text-gray-500">Allowed: .jpg, .jpeg, .png, .pdf, .zip, etc.</p>
              </div>
              <button type="submit" className="w-full bg-[#16689A] text-white py-2 rounded-lg hover:bg-blue-800 transition">
                Submit
              </button>
            </form>
          </div>

          {/* Why Choose Us */}
          <div className="md:col-span-2 w-full">
            <div className="bg-[#16689A] text-white text-base font-semibold p-3 mt-10 text-center rounded-xl">
              Why Choose HobbyistDecals?
            </div>
            <div className="border border-gray-300 p-5 bg-white rounded-xl space-y-2 text-sm leading-relaxed">
              <p><strong>Customization:</strong> We specialize in creating custom decals that perfectly match your specifications. Share your vision, and our expert design team will bring it to life. From logos and branding elements to intricate designs, we handle it all.</p>
              <p><strong>Quality Materials:</strong> We use top-notch materials including Waterslide (18 micron), White Vinyl (80gsm), and Clear Vinyl (80gsm) to ensure durability and vibrant colors.</p>
              <p><strong>Advanced Printing:</strong> Our decals are printed using high-quality 1440dpi resolution and eco-solvent inks (CMYK, Lc, Lm, White, Metallic) to ensure sharp, vivid, and long-lasting prints.</p>
              <p><strong>Precut for Convenience:</strong> All our decals are precut, making them easy to apply and giving a professional finish every time. <br /><strong>No Minimum Quantity:</strong> We cater to orders of all sizes, ensuring you get the exact quantity you need without unnecessary waste.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex justify-center px-4 items-center w-full py-10">
        <div className="bg-[#16689A] text-white py-6 px-9 rounded-3xl text-center max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Get Started Today!</h2>
          <p className="text-sm md:text-base">
            Ready to take advantage of our bulk decal services? Email us at <a href="mailto:info@hobbyistdecals.com" className="font-bold underline">info@hobbyistdecals.com</a> or chat on WhatsApp:
            Search <strong>“Hobbyist Decals”</strong> (Id: <strong>live:.cid.686f9448dc2ad63a</strong>), available <strong>10am – 7pm IST</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkDecals;
