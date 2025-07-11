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
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [keyMetrics, setKeyMetrics] = useState<any>(null); 
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
    setCompanyProfile(null);
    setKeyMetrics(null); 
    setWatchlistMessage(null);

    if (!searchSymbol) {
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
        console.error("Failed to fetch price history:", await priceResponse.json());
        setPriceHistory([]); // Set to empty array to ensure no old data is shown
      } else {
        const priceHistoryData = await priceResponse.json();
        setPriceHistory(priceHistoryData.prices || []);
      }

      // Fetch Company Profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/profile/${searchSymbol}`, { headers });
      if (!profileResponse.ok) {
          console.error("Failed to fetch company profile:", await profileResponse.json());
          setCompanyProfile(null); 
      } else {
          const companyProfileData = await profileResponse.json();
          setCompanyProfile(companyProfileData);
      }

      // Fetch Key Metrics
      const keyMetricsResponse = await fetch(`${API_BASE_URL}/api/v1/key-metrics/${searchSymbol}`, { headers });
      if (!keyMetricsResponse.ok) {
          console.error("Failed to fetch key metrics:", await keyMetricsResponse.json());
          setKeyMetrics(null);
      } else {
          const keyMetricsData = await keyMetricsResponse.json();
          setKeyMetrics(keyMetricsData);
      }


    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during data fetching.");
      setStockData(null); 
      setPriceHistory([]);
      setCompanyProfile(null); 
      setKeyMetrics(null); 
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, selectedPeriod.days]);

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
  const isStockLosing = priceHistory.length > 1
  ? priceHistory[priceHistory.length - 1].close < priceHistory[0].close
  : false;

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

  // Calculate period change (points and percent) for the selected period
  let periodChange = null;
  let periodChangePercent = null;
  if (priceHistory.length > 1) {
    const first = priceHistory[0].close;
    const last = priceHistory[priceHistory.length - 1].close;
    periodChange = last - first;
    periodChangePercent = ((periodChange / first) * 100);
  }

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
            <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
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

            {/* Price Chart with Subtle Period Change Display */}
            <div className="relative w-full flex flex-col items-center">
              {priceHistory.length > 1 && (
                <div className="absolute right-2 top-2 z-10">
                  <span className={`text-sm font-medium px-2 py-1 rounded
                    ${periodChange && periodChange >= 0 ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                    {periodChange && periodChange >= 0 ? '+' : ''}
                    {periodChange?.toFixed(2)} ({periodChangePercent?.toFixed(2)}%) over {selectedPeriod.label}
                  </span>
                </div>
              )}
              {priceHistory.length > 0 ? (
                <PriceChart
                  priceHistory={priceHistory}
                  symbol={stockData.symbol}
                  isLosing={isStockLosing}
                  periodLabel={selectedPeriod.label} // Pass period label for x-axis formatting
                />
              ) : (
                <div className="w-full text-center mt-8 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
                  <p className="text-gray-400 text-xl">Historical chart data not available.</p>
                </div>
              )}
            </div>

            {/* Company Profile Display */}
            {companyProfile && (
              <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 mt-8 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
                  Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Company Name</span>
                    <span className="text-gray-200 text-xl">{companyProfile.company_name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Exchange</span>
                    <span className="text-gray-200 text-xl">{companyProfile.exchange}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Industry</span>
                    <span className="text-gray-200 text-xl">{companyProfile.industry}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Sector</span>
                    <span className="text-gray-200 text-xl">{companyProfile.sector}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">CEO</span>
                    <span className="text-gray-200 text-xl">{companyProfile.ceo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Website</span>
                    <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xl">{companyProfile.website}</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Full Time Employees</span>
                    <span className="text-gray-200 text-xl">{companyProfile.full_time_employees?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Country</span>
                    <span className="text-gray-200 text-xl">{companyProfile.country}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">IPO Date</span>
                    <span className="text-gray-200 text-xl">{companyProfile.ipo_date}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Market Cap</span>
                    <span className="text-gray-200 text-xl">${parseFloat(companyProfile.market_cap).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics Display */}
            {keyMetrics && (
              <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 mt-8 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                  Key Financial Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Date (Annual)</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.date}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">EPS</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.eps !== "N/A" ? parseFloat(keyMetrics.eps).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">P/E Ratio</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.pe_ratio !== "N/A" ? parseFloat(keyMetrics.pe_ratio).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Revenue Per Share</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.revenue_per_share !== "N/A" ? parseFloat(keyMetrics.revenue_per_share).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Net Income Per Share</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.net_income_per_share !== "N/A" ? parseFloat(keyMetrics.net_income_per_share).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Current Ratio</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.current_ratio !== "N/A" ? parseFloat(keyMetrics.current_ratio).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Debt to Equity</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.debt_to_equity !== "N/A" ? parseFloat(keyMetrics.debt_to_equity).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold text-base">Dividend Yield</span>
                    <span className="text-gray-200 text-xl">{keyMetrics.dividend_yield !== "N/A" ? `${(parseFloat(keyMetrics.dividend_yield) * 100).toFixed(2)}%` : "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null }
      </div>
    </div>
  );
};

export default StockAnalyzer;