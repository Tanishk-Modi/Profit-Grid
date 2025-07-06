import React from 'react';

const ChartSkeleton: React.FC = () => {
  return (
    <div
      className="relative w-full h-80 md:h-96 mt-8 p-4
                 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700
                 flex items-center justify-center animate-pulse"
    >
      <div className="absolute inset-0 z-0 opacity-10"
           style={{
             backgroundImage: 'linear-gradient(to right, #2d3748 1px, transparent 1px), linear-gradient(to bottom, #2d3748 1px, transparent 1px)',
             backgroundSize: '30px 30px',
           }}>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div> {/* Chart Title Placeholder */}
        <div className="h-40 bg-gray-700 rounded w-full max-w-lg mb-4"></div> {/* Main Chart Area Placeholder */}
        <div className="h-4 bg-gray-700 rounded w-3/4"></div> {/* Legend Placeholder */}
      </div>
    </div>
  );
};

export default ChartSkeleton;