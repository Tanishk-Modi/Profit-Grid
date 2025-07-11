import React from 'react';

interface KeyMetricsProps {
  keyMetrics: any;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ keyMetrics }) => {
  if (!keyMetrics) return null;

  return (
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
  );
};

export default KeyMetrics;
