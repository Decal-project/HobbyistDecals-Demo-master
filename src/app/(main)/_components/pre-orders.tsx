import React from "react";

const PreOrders = () => {
  return (
    <div className="w-full min-h-[400px] p-4 flex flex-col items-start justify-center gap-6 bg-white">
      <h2 className="capitalize text-xl text-black font-semibold">
        Yet to Decide
      </h2>
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, index) => ( 
          <div
            key={index}
            className="h-[325px] w-full flex flex-col items-center justify-center bg-gray-200 animate-pulse overflow-hidden rounded-xl"
          >
            <div className="h-[200px] w-full bg-gray-300"></div>
            <div className="flex-1 w-full flex flex-col items-center justify-between gap-4 px-3 py-4">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
              <div className="w-full flex flex-row items-center justify-between gap-2">
                <div className="w-1/3 h-3 bg-gray-300 rounded"></div>
                <div className="w-1/3 h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreOrders;
