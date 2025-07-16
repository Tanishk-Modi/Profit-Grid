import React from 'react';

interface QuoteDisplayProps {
  stockData: any;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ stockData }) => {
  if (!stockData) return null;

  return (
    <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base md:text-lg">Current Price</span>
          <span className="text-green-400 text-3xl md:text-4xl font-bold">
            ${stockData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base md:text-lg">Today's Change</span>
          <span className={`text-2xl md:text-3xl font-bold ${parseFloat(stockData.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(stockData.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({stockData.change_percent})
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base md:text-lg">Volume</span>
          <span className="text-gray-200 text-2xl md:text-3xl font-bold">
            {stockData.volume.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Open</span>
          <span className="text-gray-200 text-xl">
            ${stockData.open_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">High</span>
          <span className="text-gray-200 text-xl">
            ${stockData.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Low</span>
          <span className="text-gray-200 text-xl">
            ${stockData.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Previous Close</span>
          <span className="text-gray-200 text-xl">
            ${parseFloat(stockData.previous_close).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Last Updated</span>
          <span className="text-gray-200 text-xl">{stockData.last_updated}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;
