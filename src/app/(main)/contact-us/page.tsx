import React from "react";
import { Mail, MapPin } from "lucide-react";
import BrowsePanel from "@/components/global/browse-panel";

const Contact = () => {
  return (
<div>
    <div className="w-full">
            <BrowsePanel />
          </div>
    <div className="bg-white-100 min-h-screen">
      {/* Banner Image - Ensuring it's Above Everything */}
      <div className="w-full">
        <img
          src="images/home-best-deals-img-2.png" // Update path if needed
          alt="Contact Us"
          className="w-full h-56 md:h-64 object-cover"
        />
      </div>
    <div className="bg-white-100 min-h-screen flex items-center justify-center py-9 px-4 ">
        
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg flex flex-col md:flex-row -mt-20">
        
        {/* Left Section - Contact Info */}
        <div className="p-8 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-900">
            Get in Touch with Hobbyist Decals
          </h2>
          <p className="text-gray-600 mt-2">
            Crafting high-quality, custom decals to bring your scale models
            to life with exceptional detail and realism.
          </p>

          <div className="mt-6 space-y-4">
            {/* Location Card */}
            <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4 border border-gray-200 w-full">
              <div className="bg-[rgb(29,78,216)] w-12 h-12 flex items-center justify-center rounded-2xl">
                <MapPin className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">LOCATION ADDRESS:</p>
                <p className="text-gray-600 text-sm">
                  Kasturi Pride Complex, NIKOL 382350 INDIA
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4 border border-gray-200 w-full">
              <div className="bg-[rgb(29,78,216)] w-12 h-12 flex items-center justify-center rounded-2xl">
                <Mail className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">EMAIL ADDRESS:</p>
                <p className="text-gray-600 text-sm">info@hobbyistdecals.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Contact Form */}
        <div className="p-8 w-full md:w-1/2 bg-gray-50 rounded-lg">
          <form className="bg-white shadow-md p-6 rounded-lg border border-gray-200 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-semibold">
                  First Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-gray-700 font-semibold">
                  Last Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-gray-700 font-semibold">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="info@hobbyistdecals.com"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div className="mt-4">
              <label className="text-gray-700 font-semibold">Phone</label>
              <input
                type="tel"
                placeholder="Telephone"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div className="mt-4">
              <label className="text-gray-700 font-semibold">Message *</label>
              <textarea
                placeholder="Your message"
                className="w-full mt-1 p-2 border rounded-md h-24"
              ></textarea>
            </div>

            <button className="mt-4 bg-[rgb(29,78,216)] text-white px-4 py-2 rounded-xl hover:bg-blue-700">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
    <div className="w-full flex justify-center py-4">
    <iframe
      className="w-full max-w-4xl h-64 border-0 rounded-lg shadow-md"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14690.567186979894!2d72.63584766809564!3d23.0664413443547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f02d34f6ff%3A0x6bd17b2f378ab888!2sKasturi%20Pride%2C%20Nikol%2C%20Ahmedabad%2C%20Gujarat%20382350!5e0!3m2!1sen!2sin!4v1710653281182!5m2!1sen!2sin"
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
  </div>

  
  );
};

export default Contact;
