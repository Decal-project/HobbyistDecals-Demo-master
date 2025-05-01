"use client";

import React, { useState, useRef } from "react";

const GetAQuote = () => {
  const [fileName, setFileName] = useState("No file chosen.");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    subject: "",
    qty: "",
    message: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    } else {
      setFileName("No file chosen.");
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();

    for (const key in formData) {
      form.append(key, formData[key as keyof typeof formData]);
    }

    if (file) {
      form.append("file", file);
    }

    const res = await fetch("/api/quote", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    if (data.success) {
      alert("Quote submitted successfully!");
      setFormData({
        firstName: "",
        phone: "",
        email: "",
        subject: "",
        qty: "",
        message: ""
      });
      setFile(null);
      setFileName("No file chosen.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      alert("Submission failed.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">Get a Quote:</h2>
      <p className="text-center font-semibold mb-4" style={{ color: "#16689A" }}>
        Elevate your projects with custom decal designs from HobbyistDecals. Contact us today to get started!
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block font-semibold">First Name *</label>
            <input
              name="firstName"
              type="text"
              required
              placeholder="Anderson"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-600"
            />
          </div>
          <div className="w-1/2">
            <label className="block font-semibold">Phone</label>
            <input
              name="phone"
              type="text"
              placeholder="Telephone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold">Email Address *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="info@hobbyistdecals.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-gray-600"
          />
        </div>
        <div>
          <label className="block font-semibold">Subject</label>
          <input
            name="subject"
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-gray-600"
          />
        </div>
        <div>
          <label className="block font-semibold">Qty</label>
          <input
            name="qty"
            type="number"
            placeholder="Number"
            value={formData.qty}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-gray-600"
          />
        </div>
        <div>
          <label className="block font-semibold">Message *</label>
          <textarea
            name="message"
            required
            placeholder="Textarea"
            value={formData.message}
            onChange={handleChange}
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
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.psd,.zip"
                ref={fileInputRef}
              />
            </label>
            <span className="text-gray-600">{fileName}</span>
          </div>
        </div>
        <button className="w-full bg-[#16689A] text-white p-2 rounded-md font-semibold hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default GetAQuote;
