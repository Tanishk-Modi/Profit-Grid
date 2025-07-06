import React, { useState } from 'react';

const StockAnalyzer: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('');
  const [stockData, setStockData] = useState<any>(null); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!symbol) {
      setError("Please enter a stock symbol.");
      return;
    }
    setLoading(true);
    setError(null);
    setStockData(null); // Clear previous data

    try {
      const response = await fetch(`http://localhost:8000/api/v1/stock/${symbol}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch stock data.');
      }
      const data = await response.json();
      setStockData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen pt-16 pb-8
                 bg-gradient-to-b from-gray-900 to-black text-gray-100 overflow-hidden"
    >
      {/* Background Grid/Effect */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(to right, #2d3748 1px, transparent 1px), linear-gradient(to bottom, #2d3748 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 70%)',
        }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 text-center p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Title/Header */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
          Real-time Market Analysis
        </h1>

        {/* Stock Search Input and Button */}
        <div className="flex w-full max-w-md bg-gray-800 rounded-full shadow-lg overflow-hidden mb-8">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="flex-grow px-6 py-3 bg-transparent text-gray-200 placeholder-gray-500
                       focus:outline-none focus:ring-0 text-lg md:text-xl"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            }}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 font-semibold text-lg
                       bg-gradient-to-r from-teal-500 to-green-600
                       hover:from-teal-600 hover:to-green-700
                       transition-all duration-300 ease-in-out
                       shadow-md transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Analyze
          </button>
        </div>

        {/* Loading, Error, and Stock Data Display */}
        {loading && (
          <div className="text-green-500 text-xl md:text-2xl mt-4">
            Loading analysis...
          </div>
        )}

        {error && (
          <div className="text-red-500 text-xl md:text-2xl mt-4">
            Error: {error}
          </div>
        )}

        {stockData && (
          <div className="w-full text-left bg-gray-800 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6">
              {stockData.symbol} Overview
            </h2>

            {/* Comprehensive Quote Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">

              {/* Current Price */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base md:text-lg">Current Price</span>
                <span className="text-green-400 text-3xl md:text-4xl font-bold">${stockData.price.toFixed(2)}</span>
              </div>

              {/* Change & Change Percent */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base md:text-lg">Today's Change</span>
                <span className={`text-2xl md:text-3xl font-bold ${parseFloat(stockData.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockData.change} ({stockData.change_percent})
                </span>
              </div>

              {/* Volume */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base md:text-lg">Volume</span>
                <span className="text-gray-200 text-2xl md:text-3xl font-bold">
                  {stockData.volume.toLocaleString()}
                </span>
              </div>

              {/* Open Price */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base">Open</span>
                <span className="text-gray-200 text-xl">${stockData.open_price.toFixed(2)}</span>
              </div>

              {/* High Price */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base">High</span>
                <span className="text-gray-200 text-xl">${stockData.high.toFixed(2)}</span>
              </div>

              {/* Low Price */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base">Low</span>
                <span className="text-gray-200 text-xl">${stockData.low.toFixed(2)}</span>
              </div>

              {/* Previous Close */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base">Previous Close</span>
                <span className="text-gray-200 text-xl">${parseFloat(stockData.previous_close).toFixed(2)}</span>
              </div>

              {/* Last Updated */}
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-base">Last Updated</span>
                <span className="text-gray-200 text-xl">{stockData.last_updated}</span>
              </div>

            </div> {/* End of grid */}
          </div>
        )}

        {!loading && !error && !stockData && (
            <p className="text-gray-400 text-xl mt-8">
                Enter a stock symbol above to begin your analysis.
            </p>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;