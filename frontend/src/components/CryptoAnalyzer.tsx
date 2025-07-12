import React, { useState, useCallback } from 'react';
import QuoteSkeleton from './QuoteSkeleton';
import TradingViewChart from './TradingViewChart';
import SymbolOverview from './SymbolOverview';
import NewsWidget from './NewsWidget';
import AnalysisWidget from './AnalysisWidget';
import TickerTape from './TickerTape';

// Helper to normalize input to a TradingView crypto symbol (e.g. BTC -> BTCUSD)
function normalizeCryptoSymbol(input: string): string {
  const upper = input.trim().toUpperCase();
  // If already looks like BTCUSD, ETHUSD, etc.
  if (/^[A-Z]{3,10}USD$/.test(upper)) return upper;
  // If just BTC, ETH, etc., convert to BTCUSD, ETHUSD
  if (/^[A-Z]{2,6}$/.test(upper)) return upper + 'USD';
  return upper;
}

const CryptoAnalyzer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [symbol, setSymbol] = useState<string>(''); // symbol for widgets
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTradingViewChart, setShowTradingViewChart] = useState<boolean>(false);

  const handleSearch = useCallback(async (searchInput: string) => {
    setLoading(true);
    setError(null);
    setShowTradingViewChart(false);

    if (!searchInput) {
      setError("Please enter a crypto symbol.");
      setLoading(false);
      return;
    }

    // Normalize input to TradingView symbol (BTC -> BTCUSD)
    const normalized = normalizeCryptoSymbol(searchInput);
    setSymbol(normalized);

    // Simulate loading for UX
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Toggle chart type between SymbolOverview and TradingViewChart
  const toggleChartType = useCallback(() => {
    setShowTradingViewChart(prev => !prev);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen pt-16 pb-8
                 bg-gradient-to-b from-gray-925 to-black text-gray-100 overflow-hidden"
    >
      {/* Background Grid/Effect - Orange/Black Theme */}
      <div
        className="absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(to right, #fb923c 1px, transparent 1px), linear-gradient(to bottom, #ea580c 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 80%)',
        }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 text-center p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Title/Header */}
        <h1 className="p-6 text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          Crypto Market Insight
        </h1>

        {/* Crypto Search Input and Button */}
        <div className="flex w-full max-w-md bg-gray-900 rounded-full shadow-lg overflow-hidden mb-8">
          <input
            type="text"
            placeholder="Enter symbol (e.g., BTC, ETH, BTCUSD, ETHUSD)"
            className="flex-grow px-6 py-3 bg-transparent text-gray-200 placeholder-gray-500
             focus:outline-none focus:ring-0 text-sm md:text-lg lg:text-xl
             placeholder:text-sm md:placeholder:text-base"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(inputValue);
              }
            }}
          />
          <button
            onClick={() => handleSearch(inputValue)}
            className="px-6 py-3 font-semibold text-lg
                       bg-gradient-to-r from-orange-500 to-red-600
                       hover:from-orange-600 hover:to-red-700
                       transition-all duration-300 ease-in-out
                       shadow-md transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 text-gray-900"
          >
            Analyze Crypto
          </button>
        </div>

        {/* --- CONDITIONAL RENDERING BLOCK --- */}
        {loading ? (
          <div className="w-full">
            <QuoteSkeleton />
          </div>
        ) : error ? (
          <div className="text-red-500 text-xl md:text-2xl mt-4">
            Error: {error}
          </div>
        ) : symbol ? (
          <div className="w-full">
            {/* Chart Container */}
            <div className="relative w-full flex flex-col items-center mt-8">
              {/* Toggle Button */}
              <button
                onClick={toggleChartType}
                title={showTradingViewChart ? "Show Basic Chart" : "Show Advanced Chart"}
                className="absolute top-3 right-4 z-20 p-2 rounded-full bg-gray-800/70 border border-gray-700 shadow-md hover:bg-orange-700/80 transition-colors duration-200
                           text-orange-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label={showTradingViewChart ? "Show Basic Chart" : "Show Advanced Chart"}
              >
                {/* Swap icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-10l4 4m-4-4v4m-6 8H7a2 2 0 01-2-2v-6a2 2 0 012-2h2m0 10l-4-4m4 4v-4" />
                </svg>
              </button>

              {/* Conditional Chart Rendering */}
              {showTradingViewChart ? (
                <div className="w-full h-[400px]">
                  <TradingViewChart symbol={symbol} theme="dark" />
                </div>
              ) : (
                <div className="w-full h-[400px]">
                  <SymbolOverview symbol={symbol} />
                </div>
              )}
            </div>

            {/* News & Analysis Widgets */}
            <div className="w-full flex flex-col md:flex-row gap-8 mt-8">
              <div className="md:w-1/2 w-full bg-gray-900 bg-opacity-70 p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
                  Latest News
                </h3>
                <NewsWidget symbol={symbol} />
              </div>
              <div className="md:w-1/2 w-full bg-gray-900 bg-opacity-70 p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                  Technical Analysis
                </h3>
                <AnalysisWidget symbol={symbol} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CryptoAnalyzer;