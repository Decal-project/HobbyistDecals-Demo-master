import React from 'react';
import CountUp from 'react-countup';

const StatBox = ({ title, end, inView }: { title: string, end: number, inView: boolean }) => {
  let displayValue = end;
  let suffix = '+';

  if (end === 3 || end === 2 || end === 5) {
    displayValue = end;
    suffix = 'K+';
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow text-center">
      <h2 className="text-4xl font-bold text-[#16689A]">
        {inView ? <CountUp end={displayValue} duration={2} suffix={suffix} /> : `0${suffix}`}
      </h2>
      <p className="mt-2 text-sm font-semibold text-gray-800">{title}</p>
    </div>
  );
};

export default StatBox;
