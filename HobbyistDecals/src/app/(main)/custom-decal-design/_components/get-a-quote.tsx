"use client";

import React, { useState } from "react";

const GetAQuote: React.FC = () => {
  const [fileName, setFileName] = useState<string>("No file chosen.");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName("No file chosen.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">Get a Quote:</h2>
      <p className="text-center font-semibold mb-4" style={{ color: "#16689A" }}>
        Elevate your projects with custom decal designs from HobbyistDecals. Contact us today to get started!
      </p>
      <form className="space-y-4">
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block font-semibold">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Anderson"
              className="w-full p-2 border rounded-md text-gray-600"
            />
            <small className="text-gray-500 italic">Enter your first name here</small>
          </div>
          <div className="w-1/2">
            <label className="block font-semibold">Phone</label>
            <input
              type="text"
              placeholder="Telephone"
              className="w-full p-2 border rounded-md text-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="info@hobbyistdecals.com"
            className="w-full p-2 border rounded-md text-gray-600"
          />
          <small className="text-gray-500 italic">Example: user@website.com</small>
        </div>
        <div>
          <label className="block font-semibold">Subject</label>
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-2 border rounded-md text-gray-600"
          />
        </div>
        <div>
          <label className="block font-semibold">Qty</label>
          <input
            type="number"
            placeholder="Number"
            className="w-full p-2 border rounded-md text-gray-600"
          />
        </div>
        <div>
          <label className="block font-semibold">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Textarea"
            className="w-full p-2 border rounded-md text-gray-600"
          ></textarea>
        </div>
        <div>
          <label className="block font-semibold">File Upload</label>
          <div className="flex items-center gap-3">
            <label className="bg-orange-600 text-white px-4 py-2 rounded-md cursor-pointer font-semibold">
              Choose a file
              <input
                type="file"
                className="hidden"
                accept=".jpg, .jpeg, .png, .pdf, .doc, .docx, .psd, .zip"
                onChange={handleFileChange}
              />
            </label>
            <span className="text-gray-600">{fileName}</span>
          </div>
          <p className="text-red-500 text-sm mt-1">
            Please upload reference images or files. We accept .jpg, .jpeg, .png, .pdf, .doc, .docx, .psd, .zip file formats by default.
            For other file formats, please create a .zip folder and upload it.
          </p>
        </div>
        <button className="w-full bg-[#16689A] text-white p-2 rounded-md font-semibold hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default GetAQuote;
