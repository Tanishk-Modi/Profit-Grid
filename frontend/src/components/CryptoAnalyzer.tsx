import React from 'react';

const CryptoAnalyzer: React.FC = () => {
  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen pt-16 pb-8
                 bg-gradient-to-b from-gray-950 to-black text-gray-100 overflow-hidden"
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
            placeholder="Enter crypto symbol (e.g., BTC)"
            className="flex-grow px-6 py-3 bg-transparent text-gray-200 placeholder-gray-500
             focus:outline-none focus:ring-0 text-sm md:text-lg lg:text-xl
             placeholder:text-sm md:placeholder:text-base"
          />
          <button
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

        {/* Placeholder for Crypto TradingView Widgets */}
        <div className="w-full text-center mt-8 p-8 bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
          <p className="text-gray-400 text-xl">Crypto TradingView Widgets will go here!</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoAnalyzer;