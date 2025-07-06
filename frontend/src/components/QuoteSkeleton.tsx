import React from 'react';

const QuoteSkeleton: React.FC = () => {
  return (
    <div className="w-full text-left bg-gray-800 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div> {/* Symbol Overview Title Placeholder */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">

        {/* Current Price Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div> {/* Label Placeholder */}
          <div className="h-8 bg-gray-700 rounded w-3/4"></div> {/* Value Placeholder */}
        </div>

        {/* Change & Change Percent Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div> {/* Label Placeholder */}
          <div className="h-8 bg-gray-700 rounded w-3/4"></div> {/* Value Placeholder */}
        </div>

        {/* Volume Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div> {/* Label Placeholder */}
          <div className="h-8 bg-gray-700 rounded w-3/4"></div> {/* Value Placeholder */}
        </div>

        {/* Open Price Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/3 mb-1"></div> {/* Label Placeholder */}
          <div className="h-7 bg-gray-700 rounded w-2/3"></div> {/* Value Placeholder */}
        </div>

        {/* High Price Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/3 mb-1"></div> {/* Label Placeholder */}
          <div className="h-7 bg-gray-700 rounded w-2/3"></div> {/* Value Placeholder */}
        </div>

        {/* Low Price Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/3 mb-1"></div> {/* Label Placeholder */}
          <div className="h-7 bg-gray-700 rounded w-2/3"></div> {/* Value Placeholder */}
        </div>

        {/* Previous Close Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div> {/* Label Placeholder */}
          <div className="h-7 bg-gray-700 rounded w-2/3"></div> {/* Value Placeholder */}
        </div>

        {/* Last Updated Skeleton */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div> {/* Label Placeholder */}
          <div className="h-7 bg-gray-700 rounded w-2/3"></div> {/* Value Placeholder */}
        </div>

      </div> {/* End of grid */}
    </div>
  );
};

export default QuoteSkeleton;