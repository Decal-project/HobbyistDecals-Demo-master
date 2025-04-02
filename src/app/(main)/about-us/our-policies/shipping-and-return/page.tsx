"use client";

export default function ShippingAndReturn() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 md:p-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping & Return Policy</h1>

      <p className="text-xl text-gray-600 mb-12 leading-relaxed">
        At <span className="font-medium">HobbyistDecals</span>, we understand the importance of prompt and reliable delivery
        for your creative projects. Here’s a detailed overview of our shipping policies and rates:
      </p>

      <div className="bg-white w-full p-10 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Domestic Shipping (India):</h2>
        <ul className="list-disc text-gray-700 text-lg space-y-3 pl-6">
          <li>Standard Shipping: $4.00</li>
          <li>Estimated Delivery Time: 5-7 business days.</li>
        </ul>
      </div>

      <div className="bg-white w-full p-10 rounded-lg shadow border border-gray-200 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">International Shipping Rates:</h2>
        <ul className="list-disc text-gray-700 text-lg space-y-6 pl-6">
          <li>
            <span className="font-semibold">Germany, Spain, France :</span><br />
            Standard Shipping: $9.80<br />
            Additional Quantity: $0.10 per item<br />
            Estimated Delivery Time: 10-15 business days
          </li>
          <li>
            <span className="font-semibold">Australia, Canada, New Zealand, Italy, Austria, South Korea :</span><br />
            Standard Shipping: $13.80<br />
            Additional Quantity: $0.10 per item<br />
            Estimated Delivery Time: 10-15 business days
          </li>
          <li>
            <span className="font-semibold">United States, United Kingdom :</span><br />
            Standard Shipping: $8.50<br />
            Additional Quantity: $0.10 per item<br />
            Estimated Delivery Time: 10-15 business days
          </li>
        </ul>
      </div>

      <div className="bg-white w-full p-10 rounded-lg shadow border border-gray-200 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Other Countries:</h2>
        <ul className="list-disc text-gray-700 text-lg space-y-3 pl-6">
          <li>Standard Shipping: $15.10</li>
          <li>Additional Quantity: $0.10 per item</li>
          <li>Estimated Delivery Time: 10-20 business days</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-5">Important Notes :</h2>
      <ul className="list-disc text-gray-700 text-lg space-y-3 pl-6">
        <li>Delivery times are estimates and may vary due to customs processing or other unforeseen delays.</li>
        <li>Shipping rates are calculated based on the initial quantity and include a small fee for additional items.</li>
        <li>All orders are processed and shipped within 2 business days after payment confirmation.</li>
      </ul>

      <h1 className="text-4xl font-bold text-gray-900 mt-20 mb-8">Return & Replacement Policy</h1>

      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
        Customer satisfaction is our highest priority. While we do not accept returns, we are committed to ensuring that
        you receive high-quality products that meet your expectations.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-5">Replacement Policy:</h2>
      <ul className="list-disc text-gray-700 text-lg space-y-5 pl-6">
        <li>
          <span className="font-semibold">Eligibility for Replacement :</span> If you receive a decal with any issues
          related to design, size, or color, you are eligible for a replacement.
        </li>
        <li>
          <span className="font-semibold">Notification Period :</span> You must notify us within 7 days of receiving
          your order to qualify for a replacement.
        </li>
        <li>
          <span className="font-semibold">How to Request a Replacement :</span> Contact our customer service team via email at
          <span className="font-semibold underline ml-1">info@hobbyistdecals.com</span>. Provide your order number,
          a description of the issue, and photos of the decal in question.
        </li>
        <li>
          <span className="font-semibold">Processing Your Request:</span> Once we receive your request, our team will review
          the details and process your replacement. If the issue is confirmed, we will send you a new decal at no additional cost.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-5">Additional Information:</h2>
      <ul className="list-disc text-gray-700 text-lg space-y-3 pl-6">
        <li>We do not offer refunds or accept returns unless the product is defective due to an error on our part.</li>
        <li>
          If you have any questions or concerns about your order, please contact our customer service team, and we will be
          happy to assist you.
        </li>
      </ul>

      <div className="bg-white w-full p-10 rounded-lg shadow border border-gray-200 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us:</h2>
        <ul className="list-disc text-gray-700 text-lg space-y-6 pl-6">
          <li>
            For any inquiries regarding our shipping or replacement policies, please reach out to us at
            <a href="mailto:info@hobbyistdecals.com" className="font-semibold underline ml-1">info@hobbyistdecals.com</a>
            or call us at
            <a href="tel:+917946018376" className="font-semibold underline ml-1">+91 (79) 46018376</a>.
          </li>
          <li>
            Our customer service team is available Monday to Friday, 10 AM to 7 PM (IST), and we are dedicated to ensuring you have a positive experience with HobbyistDecals.
          </li>
        </ul>
        <p className="text-gray-800 font-semibold text-lg mt-6">
          Thank you for choosing HobbyistDecals. We look forward to helping you bring your creative visions to life!
        </p>
      </div>
    </div>
  );
}
