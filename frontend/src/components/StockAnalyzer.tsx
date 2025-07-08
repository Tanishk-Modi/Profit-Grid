import React, { useState, useEffect, useCallback } from 'react'; 
import QuoteSkeleton from './QuoteSkeleton';
import ChartSkeleton from './ChartSkeleton';
import PriceChart from './PriceChart';

interface StockAnalyzerProps {
  authToken: string | null;
  currentUserId: number | null;
  initialSymbol: string | null; 
}

const PERIOD_OPTIONS = [
  { label: '1M', days: 22 },   // ~22 trading days in a month
  { label: '3M', days: 66 },   // ~66 trading days in 3 months
  { label: '1Y', days: 252 },  // ~252 trading days in a year
  { label: '5Y', days: 1260 }, // ~252*5
];

const StockAnalyzer: React.FC<StockAnalyzerProps> = ({ authToken, currentUserId, initialSymbol }) => {

  const [symbol, setSymbol] = useState<string>(''); 
  const [stockData, setStockData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[1]);

  const handleSearch = useCallback(async (searchSymbol: string, days: number = selectedPeriod.days) => {
    setLoading(true);
    setError(null);
    setStockData(null);
    setPriceHistory([]);
    setWatchlistMessage(null);

    if (!searchSymbol) { // Ensure this check happens before the fetch
      setError("Please enter a stock symbol.");
      setLoading(false);
      return;
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

     // Fetch Stock Quote
      const stockResponse = await fetch(`${API_BASE_URL}/api/v1/stock/${searchSymbol}`, { headers });
      if (!stockResponse.ok) {
        const errorData = await stockResponse.json();
        throw new Error(errorData.detail || 'Failed to fetch stock quote. Please check the symbol and try again.');
      }
      const stockQuoteData = await stockResponse.json();
      setStockData(stockQuoteData);

      // Fetch Price History with days param
      const priceResponse = await fetch(`${API_BASE_URL}/api/v1/price/${searchSymbol}?days=${days}`, { headers });
      if (!priceResponse.ok) {
        const errorData = await priceResponse.json();
        setPriceHistory([]);
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
  }, [API_BASE_URL, selectedPeriod.days]); // Dependencies for handleSearch useCallback

  useEffect(() => {
    if (initialSymbol && initialSymbol !== symbol) {
      setSymbol(initialSymbol);
      handleSearch(initialSymbol, selectedPeriod.days);
    }
  }, [initialSymbol, symbol, handleSearch, selectedPeriod.days]); 

  // Handler for period button click
  const handlePeriodChange = (period: typeof PERIOD_OPTIONS[0]) => {
    setSelectedPeriod(period);
    if (symbol) {
      handleSearch(symbol, period.days);
    }
  };

  // Calculate if the stock is losing (used for chart color)
  const isStockLosing = stockData ? parseFloat(stockData.change) < 0 : false;

  // Function to add stock to watchlist
  const handleAddToWatchlist = async () => {
    if (!authToken || !currentUserId) {
      setWatchlistMessage("Please log in to add stocks to your watchlist.");
      return;
    }
    if (!stockData || !stockData.symbol) {
      setWatchlistMessage("No stock selected to add to watchlist.");
      return;
    }

    setWatchlistMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/watchlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ symbol: stockData.symbol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to add ${stockData.symbol} to watchlist.`);
      }

      setWatchlistMessage(`${stockData.symbol} added to watchlist!`);
      setTimeout(() => setWatchlistMessage(null), 3000);

    } catch (err: any) {
      setWatchlistMessage(`Error: ${err.message || "Failed to add to watchlist."}`);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen pt-16 pb-8
                 bg-gradient-to-b from-gray-900 to-black text-gray-100 overflow-hidden"
    >
      {/* Background Grid/Effect */}
      <div
        className="absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 80%)',
        }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 text-center p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Title/Header */}
        <h1 className="p-6 text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
          Advanced Market Intelligence
        </h1>

        {/* Stock Search Input and Button */}
        <div className="flex w-full max-w-md bg-gray-900 rounded-full shadow-lg overflow-hidden mb-8">
          <input
            type="text"
            placeholder="Enter ticker symbol (e.g., AAPL)"
            className="flex-grow px-6 py-3 bg-transparent text-gray-200 placeholder-gray-500
             focus:outline-none focus:ring-0 text-sm md:text-lg lg:text-xl
             placeholder:text-sm md:placeholder:text-base"
            value={symbol} // Bind input value to 'symbol' state
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleSearch(symbol); // Use current symbol state
                }
            }}
          />
          <button
            onClick={() => handleSearch(symbol)} // Use current symbol state
            className="px-6 py-3 font-semibold text-lg
                       bg-gradient-to-r from-teal-500 to-green-600
                       hover:from-teal-600 hover:to-green-700
                       transition-all duration-300 ease-in-out
                       shadow-md transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-gray-900"
          >
            Analyze
          </button>
        </div>

        {/* --- CONDITIONAL RENDERING BLOCK --- */}
        {loading ? (
          <div className="w-full">
            <QuoteSkeleton />
            <ChartSkeleton />
          </div>
        ) : error ? (
          <div className="text-red-500 text-xl md:text-2xl mt-4">
            Error: {error}
          </div>
        ) : stockData ? (
          <div className="w-full">
            {/* Add to Watchlist Button and Message */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                {stockData.symbol} Overview
              </h2>
              {authToken && ( // Only show if user is logged in
                <button
                  onClick={handleAddToWatchlist}
                  className="px-4 py-2 rounded-md font-semibold text-base
                             bg-gradient-to-r from-blue-500 to-indigo-600
                             hover:from-blue-600 hover:to-indigo-700
                             transition-all duration-300 ease-in-out
                             focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Add to Watchlist
                </button>
              )}
            </div>
            {watchlistMessage && (
              <p className={`text-sm mb-4 ${watchlistMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {watchlistMessage}
              </p>
            )}

            {/* Comprehensive Quote Display Grid */}
            <div className="w-full text-left bg-gray-800 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base md:text-lg">Current Price</span>
                  <span className="text-green-400 text-3xl md:text-4xl font-bold">${stockData.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base md:text-lg">Today's Change</span>
                  <span className={`text-2xl md:text-3xl font-bold ${parseFloat(stockData.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockData.change} ({stockData.change_percent})
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
                  <span className="text-gray-200 text-xl">${stockData.open_price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base">High</span>
                  <span className="text-gray-200 text-xl">${stockData.high.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base">Low</span>
                  <span className="text-gray-200 text-xl">${stockData.low.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base">Previous Close</span>
                  <span className="text-gray-200 text-xl">${parseFloat(stockData.previous_close).toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-semibold text-base">Last Updated</span>
                  <span className="text-gray-200 text-xl">{stockData.last_updated}</span>
                </div>
              </div>
            </div>

            {/* Period Selection Bar */}
            <div className="w-full flex justify-center my-6">
              <div className="flex flex-row gap-2 bg-gray-900 bg-opacity-80 rounded-full px-4 py-2 shadow-md border border-gray-700">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handlePeriodChange(option)}
                    className={`px-4 py-1 rounded-full font-semibold border transition-all duration-200
                      ${selectedPeriod.label === option.label
                        ? 'bg-teal-500 text-white border-teal-500 shadow'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-teal-600 hover:text-white'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Chart */}
            {priceHistory.length > 0 ? (
              <PriceChart priceHistory={priceHistory} symbol={stockData.symbol} isLosing={isStockLosing} />
            ) : (
                <div className="w-full text-center mt-8 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
                    <p className="text-gray-400 text-xl">Historical chart data not available.</p>
                </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xl mt-8">
            
          </p>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;