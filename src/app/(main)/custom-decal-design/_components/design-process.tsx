'use client';
import { useState } from 'react';

const steps = [
  { title: 'Reference Images', content: 'Provide us with your reference images or any inspiration you have for your decal design. This can include sketches, photos, or digital images.' },
  { title: 'Design Consultation', content: 'Our team will work closely with you to understand your requirements and preferences. We’ll discuss colors, sizes, and any specific details you want to include.' },
  { title: 'Design Creation', content: 'Using your reference images and input, our skilled designers will create a custom decal design that meets your specifications.' },
  { title: 'Client Confirmation', content: 'Once the design is complete, we’ll share it with you for review. We welcome your feedback and will make any necessary adjustments to ensure the design is perfect.' },
  { title: 'Final Approval', content: 'After you approve the final design, we’ll proceed with printing and producing your custom decals.' },
];
export default function DesignProcess() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <h2 className="bg-[#16689A] text-white text-center p-4 rounded-t-lg text-2xl font-semibold">
        Our Custom Decal Design Process
      </h2>
      <div className="flex border-b">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`flex-1 p-4 text-center ${activeStep === index ? 'bg-white text-orange-600 font-semibold' : 'bg-gray-100 text-black'}`}
          >
            <strong>{step.title}</strong>
          </button>
        ))}
      </div>
      <div className="p-6 text-gray-700">
        {steps[activeStep].content}
      </div>
    </div>
  );
}
