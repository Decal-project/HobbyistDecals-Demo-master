import React from "react";

const CompanyPoliciesComponent = () => {
  return (
    <div className="bg-primary w-full h-fit flex items-center justify-center py-8">
      <div className="w-[95%] flex flex-col items-start justify-center gap-4">
        <h3 className="font-semibold text-lg text-nowrap text-grey">
          Hobbyist Decals: The Ultimate Destination for Model Enthusiasts
        </h3>
        <p className="text-sm text-grey leading-6">
          Model building is an art, and at Hobbyist Decals, we bring you the
          tools to elevate your craft. Why settle for ordinary, mass-produced
          decals when you can access a premium range designed to give your
          O’Phee Trailer models unmatched detail and authenticity? Our
          meticulously crafted decals are perfect for passionate modelers who
          demand precision, durability, and easy application. Whether you’re a
          seasoned collector or a first-time builder, our decals are your key to
          transforming your models into breathtaking, true-to-life replicas.
        </p>
        <p className="text-sm text-grey leading-6">
          At Hobbyist Decals, we provide more than just stickers. Our water
          slide decals are engineered with care, ensuring that each application
          results in a flawless, professional finish. From the high-resolution
          graphics to the color-matching precision, our decals are designed to
          make your O’Phee Trailer models stand out.
        </p>
        <h3 className="font-semibold text-lg text-nowrap capitalize text-grey">
          Shipping policy
        </h3>
        <p className="text-sm text-grey leading-6">
          At HobbyistDecals, we are committed to delivering your products
          quickly and reliably. We offer fast shipping both domestically and
          internationally, so you can enjoy your decals without delay.
          Here&apos;s a breakdown of our shipping rates:
        </p>
        <ol className="flex flex-col items-start justify-center gap-2">
          <li className="text-sm leading-6 text-grey">
            <span className="font-semibold">Domestic (India): </span>
            $4.00
          </li>
          <li className="text-sm leading-6 text-grey">
            <p className="font-semibold">International Shipping: </p>
            <ol className="ml-4">
              {" "}
              <li className="text-sm leading-6 text-grey">
                <span className="font-semibold">Germany, Spain, France: </span>
                $9.80 (+$0.10 per additional item)
              </li>
              <li className="text-sm leading-6 text-grey">
                <span className="font-semibold">
                  Australia, Canada, New Zealand, Italy, Austria, South Korea:{" "}
                </span>
                $13.80 (+$0.10 per additional item)
              </li>
              <li className="text-sm leading-6 text-grey">
                <span className="font-semibold">US, UK: </span>
                $8.50 (+$0.10 per additional item)
              </li>
              <li className="text-sm leading-6 text-grey">
                <span className="font-semibold">Other Countries: </span>
                $15.10 (+$0.10 per additional item)
              </li>
            </ol>
          </li>
        </ol>
        <p className="text-grey text-sm leading-6">
          We take great care in packaging all shipments to ensure they reach you
          safely and promptly. No matter where you are, we strive to provide
          efficient delivery right to your doorstep.
        </p>
        <h3 className="font-semibold text-lg text-nowrap capitalize text-grey">
          Return Policy
        </h3>
        <p className="text-sm text-grey leading-6">
          Your satisfaction is our top priority, and we stand behind the quality
          of our products. If you encounter any issues with your order—whether
          it’s a design, size, or color concern—we offer a hassle-free
          replacement process. Simply contact us within 7 days of receiving your
          order, and we&apos;ll ensure you receive the correct product.
        </p>
        <p className="text-sm text-grey leading-6">
          For more detailed information, please refer to our comprehensive
          Shipping and Return Policy on our website. We&apos;re here to make your
          experience seamless and enjoyable!
        </p>
      </div>
    </div>
  );
};

export default CompanyPoliciesComponent;
