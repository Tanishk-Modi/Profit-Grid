import React, { useState } from 'react';
import PriceChart from './PriceChart';
import QuoteSkeleton from './QuoteSkeleton';
import ChartSkeleton from './ChartSkeleton';

const StockAnalyzer: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('');
  const [stockData, setStockData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; 

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setStockData(null);
    setPriceHistory([]);

    if (!symbol) {
      setError("Please enter a stock symbol.");
      setLoading(false); 
      return;
    }

    try {
      // --- Fetch Stock Quote ---
      const stockResponse = await fetch(`${API_BASE_URL}/api/v1/stock/${symbol}`);
      let stockQuoteData = null; 

      if (!stockResponse.ok) {
        const errorData = await stockResponse.json();
        throw new Error(errorData.detail || 'Failed to fetch stock quote. Please check the symbol and try again.');
      }
      stockQuoteData = await stockResponse.json();
      setStockData(stockQuoteData); // Update stockData state on successful fetch

      // --- Fetch Price History ---
      const priceResponse = await fetch(`${API_BASE_URL}/api/v1/price/${symbol}?days=90`);
      if (!priceResponse.ok) {
        const errorData = await priceResponse.json();
        console.warn("Warning: Failed to fetch price history:", errorData.detail); 
        setPriceHistory([]); // Empty if fetch fails
      } else {
        const priceHistoryData = await priceResponse.json();
        setPriceHistory(priceHistoryData.prices || []);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during data fetching.");
      setStockData(null); 
      setPriceHistory([]); 
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
          backgroundImage: 'linear-gradient(to right, #2d3748 1px, transparent 3px), linear-gradient(to bottom, #2d3748 1px, transparent 3px)',
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 70%)',
        }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 text-center p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Title/Header */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 p-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
          Profit-Grid: Real-time Market Analysis
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

        {/* --- CONDITIONAL RENDERING BLOCK --- */}
        {loading ? (
          // Show skeletons when loading
          <div className="w-full">
            <QuoteSkeleton />
            <ChartSkeleton />
          </div>
        ) : error ? (
          // Error Message
          <div className="text-red-500 text-xl md:text-2xl mt-4">
            Error: {error}
          </div>
        ) : stockData ? ( // If successful fetch
          <div className="w-full">
            {/* Comprehensive Quote Display Grid */}
            <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6">
                {stockData.symbol} Overview
              </h2>

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
              </div>
            </div>

            {/* Price Chart */}
            {priceHistory.length > 0 ? (
              <PriceChart priceHistory={priceHistory} symbol={stockData.symbol} />
            ) : (
                // Show a message if stock data is there but no history (e.g., failed to fetch history)
                <div className="w-full text-center mt-8 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
                    <p className="text-gray-400 text-xl">Historical chart data not available.</p>
                </div>
            )}
          </div>
        ) : (
          // Initial empty state message
          <p className="text-gray-400 text-xl mt-8">
            Enter a stock symbol above to begin your analysis.
          </p>
        )}
        {/* --- END CONDITIONAL RENDERING BLOCK --- */}

      </div>
    </div>
  );
};

export default StockAnalyzer;