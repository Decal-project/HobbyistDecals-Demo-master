import Image from 'next/image';
import BrowsePanel from "@/components/global/browse-panel";

export default function OurMedia() {
  return (
    <>
      <div className="mt-8">
        <BrowsePanel />
      </div>
      <section className="bg-gray-100 py-12 px-4 md:px-8 w-full">
        {/* Top Image */}
        <div className="w-full">
          <img 
            src="/images/custom-decal-design-img-1.png" 
            alt="Custom Decal Design"
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="mt-8">
    <BrowsePanel />
  </div>
        <div className="w-full">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mt-8">
            Our Media
          </h2>
          <p className="text-gray-600 mt-2 text-center text-lg">
            At HobbyistDecals, we use top-quality materials to ensure that your decals not only look fantastic 
            but also stand the test of time. Here’s a closer look at the premium media we use:
          </p>

          {/* Waterslide Decal Paper */}
          <div className="mt-8 flex flex-col md:flex-row items-center w-full">
            <div className="w-full md:w-1/2">
              <Image 
                src="/image.png" 
                alt="Waterslide Decal Paper"
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 p-8">
              <h3 className="text-3xl font-bold text-gray-900">Waterslide Decal Paper (18 Micron):</h3>
              <p className="text-gray-600 mt-2 text-lg">
                Our waterslide decal paper is ultra-thin at just 18 microns, allowing for seamless integration onto your models. 
                It provides a smooth, paint-like finish, perfect for professional and hobbyist applications alike.
              </p>
            </div>
          </div>

          {/* Glossy White Vinyl */}
          <div className="mt-8 flex flex-col md:flex-row-reverse items-center w-full">
            <div className="w-full md:w-1/2">
              <Image 
                src="/image-glossy-vinyl.png" 
                alt="Glossy White Vinyl"
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 p-8">
              <h3 className="text-3xl font-bold text-gray-900">Glossy White Vinyl (80gsm):</h3>
              <p className="text-gray-600 mt-2 text-lg">
                Our white vinyl decals are made from high-grade 80gsm vinyl, offering durability and vibrant color reproduction. 
                This material is perfect for projects that require a bold, opaque background.
              </p>
            </div>
          </div>

          {/* Clear Vinyl */}
          <div className="mt-8 flex flex-col md:flex-row items-center w-full">
            <div className="w-full md:w-1/2">
              <Image 
                src="/image-clear-vinyl.png" 
                alt="Clear Vinyl"
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 p-8">
              <h3 className="text-3xl font-bold text-gray-900">Clear Vinyl (80gsm):</h3>
              <p className="text-gray-600 mt-2 text-lg">
                Our clear vinyl decals are also made from durable 80gsm vinyl. This media allows the underlying surface to show through, 
                making it ideal for applications where you want a sleek, modern finish.
              </p>
            </div>
          </div>

          {/* Final Paragraph */}
          <div className="mt-12 text-center text-gray-700 text-xl">
            <p className="text-justify">
              Each of these media types is carefully selected to provide you with the best possible results, 
              ensuring that your decals are not only beautiful but also long-lasting.
              Whether you’re working on a scale model, a custom project, or anything in between, 
              HobbyistDecals has the perfect media to make your designs come to life.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
