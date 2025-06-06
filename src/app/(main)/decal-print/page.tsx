"use client";
import React, { useRef, useState } from "react";
import BrowsePanel from "@/components/global/browse-panel";

const BulkDecals = () => {
  const [formData, setFormData] = useState<{
    firstName: string;
    phone: string;
    email: string;
    subject: string;
    qty: string;
    message: string;
    file: File | null;
  }>({
    firstName: "",
    phone: "",
    email: "",
    subject: "",
    qty: "",
    message: "",
    file: null,
  });

  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    {
      id: 1,
      title: "Contact Us",
      content:
        "Reach out to us with your requirements by email 'info@hobbydecals.com' or Fill up the Form. Our team is here to assist you with the design and planning process.",
    },
    {
      id: 2,
      title: "Design Consultation",
      content:
        "Our team will work with you to refine your decal designs and ensure they meet your expectations before production.",
    },
    {
      id: 3,
      title: "Approval and Production",
      content:
        "Once you approve the final design, we proceed with high-quality production of your decals.",
    },
    {
      id: 4,
      title: "Delivery",
      content:
        "Your decals will be packaged securely and shipped to your location with tracking information provided.",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, file: e.target.files[0] });
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
    <div>
      <div className="w-full">
        <BrowsePanel />
      </div>
      <div className="mb-4 ml-2 font-sans">
        <h6 className="text-3xl font-bold mb-4 mt-10 ml-4">
          High-Quality Decal Printing for OEM Clients and More
        </h6>
        <p className="text-gray-600 mb-4 ml-4">
          At{" "}
          <span className="text-[#16689A] font-semibold">HobbyistDecals</span>,
          we offer professional decal print-only services tailored to meet the
          needs of a diverse clientele, including Original Equipment
          Manufacturer (OEM) clients, businesses, hobbyists, and individuals.
          With our state-of-the-art printing technology and premium materials,
          we ensure that every decal we produce is of the highest quality,
          vibrant, and durable.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 bg-grey-100">
        {/* Left Section */}
        <div>
          <h4 className="text-3xl font-bold mb-4">
            Affordable Pricing and Bulk Discounts
          </h4>
          <p className="text-gray-600 mb-4">
            We offer competitive pricing for our decal print-only services, with
            significant discounts for bulk orders. Contact us to get a
            customized quote based on your specific requirements.
          </p>

          <h4 className="text-3xl font-semibold mt-6">
            Tailored Services for OEM Clients
          </h4>
          <p className="text-gray-600 mb-4">
            For OEM clients, we understand the importance of precision and
            consistency. Our decal print-only services are designed to meet the
            high standards required in manufacturing and production
            environments. We ensure:
          </p>
          <ul className="text-gray-600 mb-4 list-disc pl-5">
            <li className="font-bold text-black">
              Consistent Quality:
              <span className="text-grey-600 mb-4">
                Each decal is produced to the exact specifications, maintaining
                uniformity across large orders.
              </span>
            </li>
            <li className="font-bold text-black">
              Custom Solutions :
              <span className="font-bold text-black">
                We can accommodate custom sizes, shapes, and materials to fit
                your specific needs.
              </span>
            </li>
            <li className="font-bold text-black">
              Fast Turnaround :
              <span className="font-bold text-black">
                Efficient production processes to meet tight deadlines without
                compromising on quality.
              </span>
            </li>
          </ul>

          <img
            src="/images/home-top-picks-advertisement.png"
            alt="Bulk Decals"
            className="w-full rounded-lg shadow-lg mb-6 w-[600px] h-[390px]"
          />
          <div className="bg-[#BEE2F3] text-black text-lg font-semibold p-3 text-center border rounded-xl">
            Our bulk decal services are ideal for:
          </div>
          <div className="border border-gray-300 p-4 bg-white rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-bold">Businesses:</span> Perfect for
                branding, promotional materials, and product labeling.
              </li>
              <li>
                <span className="font-bold">Events and Organizations:</span>{" "}
                Custom decals for events, fundraisers, and organizational
                branding.
              </li>
              <li>
                <span className="font-bold">Hobbyists and Collectors:</span>{" "}
                Enhance your collections with custom-designed decals.
              </li>
              <li>
                <span className="font-bold">Schools and Sports Teams:</span>{" "}
                Custom decals for team logos, mascots, and school events.
              </li>
              <li>
                <span className="font-bold">Retailers and Distributors:</span>{" "}
                Stock up on popular designs to sell or distribute.
              </li>
            </ul>
          </div>
          <br />
          <div className="bg-[#BEE2F3] text-black text-lg font-semibold p-3 text-center rounded-xl">
            How to Order Bulk Decals?
          </div>
          <div className="bg-gray-100 flex flex-wrap md:flex-nowrap border-b border-gray-300 rounded-xl">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`flex-1 text-center py-3 px-4 text-sm md:text-base font-semibold transition ${
                  activeTab === step.id
                    ? "text-[#16689A] border-b-4 border-[#16689A] bg-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {step.id}. {step.title}
              </button>
            ))}
          </div>
          <div className="p-5 border border-gray-300 bg-white rounded-xl">
            <p className="text-gray-700">
              {steps.find((step) => step.id === activeTab)?.content}
            </p>
          </div>
        </div>

        {/* Right Section - Get a Quote Form */}
        <div className="flex flex-col items-center w-full">
          <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Get a Quote:</h2>
            <p className="text-[#16689A] text-center mb-4">
              Elevate your projects with high-quality decal printing from
              HobbyistDecals. Contact us today to get started!
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
              <button type="submit" className="w-full bg-[#BEE2F3] text-black py-2 rounded-lg hover:bg-blue-800 transition">
                Submit
              </button>
            </form>
          </div>

          {/* Why Choose HobbyistDecals? */}
          <div className="md:col-span-2 w-full">
            <div className="bg-[#BEE2F3] text-black text-lg font-semibold p-3 mt-10 text-center rounded-xl">
              Why Choose HobbyistDecals?
            </div>
            <div className="border border-gray-300 p-5 bg-white rounded-xl space-y-2">
              <p>
                <span className="font-bold">Customization:</span> We specialize
                in creating custom decals that perfectly match your
                specifications. Share your vision, and our expert design team
                will bring it to life. From logos and branding elements to
                intricate designs, we handle it all.
              </p>
              <p>
                <span className="font-bold">Quality Materials:</span> We use
                top-notch materials including Waterslide (18 micron), White
                Vinyl (80gsm), and Clear Vinyl (80gsm) to ensure durability and
                vibrant colors.
              </p>
              <p>
                <span className="font-bold">Advanced Printing Technology:</span>{" "}
                Our decals are printed using high-quality 1440dpi resolution and
                eco-solvent inks (CMYK, Lc, Lm, White, Metallic) to ensure
                sharp, vivid, and long-lasting prints.
              </p>
              <p>
                <span className="font-bold">Precut for Convenience:</span> All
                our decals are precut, making them easy to apply and giving a
                professional finish every time. No Minimum Quantity: We cater to
                orders of all sizes, ensuring you get the exact quantity you
                need without unnecessary waste.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 items-center w-full py-10">
        <div className="bg-[#BEE2F3] text-black py-6 px-9 rounded-3xl text-center max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Get Started Today!</h2>
          <p className="text-sm md:text-base text-black">
            Ready to take advantage of our bulk decal services? Contact us now
            to discuss your project and receive a personalized quote. Email us
            at{" "}
            <a
              href="mailto:info@hobbyistdecals.com"
              className="font-bold underline"
            >
              info@hobbyistdecals.com
            </a>{" "}
            or chat on WhatsApp: Search{" "}
            <span className="font-bold">“Hobbyist Decals”</span> (
            <span className="font-semibold">Id: live:.cid.686f9448dc2ad63a</span>
            ), <span className="font-semibold">(10am – 7pm **IST**)</span>. Let
            Hobbyist Decals provide you with the high-quality, customized decals
            you need at an unbeatable price.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkDecals;
