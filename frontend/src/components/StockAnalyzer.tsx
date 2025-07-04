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
      {/* Background Grid/Effect*/}
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
        {/* Title/Header*/}
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
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-4">
              {stockData.symbol} Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p>
                <span className="font-semibold text-gray-400">Price:</span>{' '}
                <span className="text-green-400 text-2xl">${stockData.price.toFixed(2)}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-400">Change:</span>{' '}
                <span className={parseFloat(stockData.change) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {stockData.change} ({stockData.change_percent})
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-400">Last Updated:</span>{' '}
                {stockData.last_updated}
              </p>
              {/* More data points can be added here as needed (e.g., volume, high, low) */}
            </div>
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