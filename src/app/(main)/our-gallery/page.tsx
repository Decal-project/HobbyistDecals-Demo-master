'use client';

import React, { useState } from 'react';
import BrowsePanel from "@/components/global/browse-panel";
import Masonry from 'react-masonry-css';
import { ZoomIn, ZoomOut } from 'lucide-react';

const GalleryPage = () => {
  const totalImages = 52;
  const imagesPerLoad = 12;
  const [visibleCount, setVisibleCount] = useState(imagesPerLoad);

  const [fullImageSrc, setFullImageSrc] = useState('');
  const [fullImageAlt, setFullImageAlt] = useState('');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  
  const [zoom, setZoom] = useState(1);

  const imageList = Array.from({ length: totalImages }, (_, i) => `img${i + 1}.jpg`);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + imagesPerLoad, totalImages));
  };

  const openImage = (index: number) => {
    const src = `/anave_images/${imageList[index]}`;
    setCurrentIndex(index);
    setFullImageSrc(src);
    setFullImageAlt(`Gallery Image ${index + 1}`);
    document.body.style.overflow = 'hidden';
  };

  const closeImage = () => {
    setFullImageSrc('');
    setFullImageAlt('');
    setCurrentIndex(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction: 'left' | 'right') => {
    if (currentIndex === null) return;
    const newIndex =
      direction === 'left'
        ? (currentIndex - 1 + imageList.length) % imageList.length
        : (currentIndex + 1) % imageList.length;
    setCurrentIndex(newIndex);
    setFullImageSrc(`/anave_images/${imageList[newIndex]}`);
    setFullImageAlt(`Gallery Image ${newIndex + 1}`);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = fullImageSrc;
    link.download = fullImageSrc.split('/').pop() || 'download.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(fullImageSrc, '_blank');
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  return (
    <>
      <div className="w-full">
        <BrowsePanel />
      </div>

      <div className="w-full mt-0">
        <img
          src="/images/custom-decal-design-img-1.png"
          alt="Custom Decal Banner"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="w-full px-6 py-10 bg-gray-50 text-gray-800">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900">
          Welcome to the HobbyistDecals Gallery!
        </h1>
        <p className="text-lg mb-4 text-gray-700">
          Explore our client’s collection of stunning scale models, each brought to life with our high-quality decals. Our gallery showcases the precision, clarity and vibrant colors of HobbyistDecals in action, highlighting the exceptional detail and craftsmanship that goes into every piece.
        </p>
        <p className="text-lg mb-4 text-gray-700">
          From intricate car models to detailed aircraft and unique custom creations, our decals enhance every project, ensuring a professional finish. Browse through the images below to see how our precut, high-resolution decals transform scale models into true works of art.
        </p>
        <p className="text-lg mb-10 text-gray-700">
          Each photo in our gallery is a testament to the quality and versatility of HobbyistDecals. Whether you’re an experienced modeler or just starting out, our decals provide the perfect finishing touch to your projects.
        </p>

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 text-center">Our Gallery</h2>
          <div className="h-1 w-20 mx-auto bg-orange-600 rounded-full mb-10" />

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto gap-4"
            columnClassName="my-masonry-column"
          >
            {imageList.slice(0, visibleCount).map((img, index) => {
              const imageSrc = `/anave_images/${img}`;
              const imageAlt = `Gallery Image ${index + 1}`;
              return (
                <div
                  key={index}
                  className="relative group mb-4 cursor-pointer"
                  onClick={() => openImage(index)}
                >
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full rounded-lg shadow-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex justify-center items-center transition-all duration-300 rounded-lg">
                    <img
                      src="/images/search.png"
                      alt="Zoom"
                      className="w-12 h-12 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </Masonry>

          {visibleCount < totalImages && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Featured Projects :</h3>

          <div className="mb-6">
            <div className="bg-[#16689A] text-white font-bold py-4 px-6 rounded-full">
              Classic Car Models
            </div>
            <div className="border border-[#1478A6] rounded-3xl p-6 text-gray-700 mt-[-20px] pt-8">
              Admire the sleek lines and authentic details achieved with our custom car decals.
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-[#16689A] text-white font-bold py-4 px-6 rounded-full">
              Aircraft Models
            </div>
            <div className="border border-[#1478A6] rounded-3xl p-6 text-gray-700 mt-[-20px] pt-8">
              Experience the precision and accuracy of our decals on various aircraft models, from vintage warplanes to modern jets.
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-[#16689A] text-white font-bold py-4 px-6 rounded-full">
              Custom Creations
            </div>
            <div className="border border-[#1478A6] rounded-3xl p-6 text-gray-700 mt-[-20px] pt-8">
              See how hobbyists have used our decals to personalize and enhance their unique projects.
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4 mt-10">Share Your Work!</h3>
        <p className="text-md text-gray-700">
          We love seeing how our customers use HobbyistDecals in their projects. Share your own scale model creations with us on social media using the hashtag #HobbyistDecals, and you could be featured in our gallery!
        </p>

        <img
          src="/images/custom-decal-design-img-1.png"
          alt="Custom Decal Banner"
          className="w-full h-auto object-cover mt-8 rounded-lg shadow-md"
        />
      </div>

      {fullImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
          <button
            onClick={() => navigateImage('left')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10"
          >
            &#8592;
          </button>

          <img
            src={fullImageSrc}
            alt={fullImageAlt}
            className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            style={{ transform: `scale(${zoom})` }}
          />

          <button
            onClick={() => navigateImage('right')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10"
          >
            &#8594;
          </button>

          <div className="absolute top-4 right-4 flex flex-col gap-3 z-50">
            <button
              onClick={closeImage}
              className="bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={openInNewTab}
              className="bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-2"
              aria-label="Fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 10v3a2 2 0 002 2h3m10-18h3a2 2 0 012 2v3m0 10v3a2 2 0 01-2 2h-3" />
              </svg>
            </button>

            {/* Zoom Controls */}
            <button
              onClick={zoomIn}
              className="bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-2"
              aria-label="Zoom In"
            >
              <ZoomIn className="h-6 w-6" />
            </button>

            <button
              onClick={zoomOut}
              className="bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-2"
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-6 w-6" />
            </button>
            <button
              onClick={downloadImage}
              className="bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-2"
              aria-label="Download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;
