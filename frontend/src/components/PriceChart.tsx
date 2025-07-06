import React from 'react';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
);
interface PriceChartProps {
  priceHistory: { date: string; close: number }[];
  symbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, symbol }) => {
  // Prepare data for Chart.js
  const sortedData = [...priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labels = sortedData.map((dataPoint) => dataPoint.date);
  const dataValues = sortedData.map((dataPoint) => dataPoint.close);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `${symbol} Close Price`,
        data: dataValues,
        fill: 'start', // Fill area under the line starting from the X-axis
        backgroundColor: (context: any) => { // Gradient fill for the area
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return;
          }
          // Fill Gradient
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          // Top color 
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)'); // Tailwind green-500 , 30% opacity
          // Bottom color 
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)'); // Tailwind green-500 , 0% opacity
          return gradient;
        },
        borderColor: '#10B981', // Line color
        tension: 0.2, // Smooth look
        pointRadius: 0, // No individual data points visible on line
        pointHoverRadius: 5, // Show points only on hover
        pointHitRadius: 10, // Increase hit area for easier hovering
        borderWidth: 2, // Line thickness
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true, // Hide chart title
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // bg-gray-900 with opacity for dark tooltip background
        titleColor: '#F9FAFB', // Light text for title (date)
        bodyColor: '#D1D5DB', // Slightly darker light text for body (price)
        borderColor: '#10B981', // Green border for accent
        borderWidth: 1, // Border thickness
        cornerRadius: 4, // Rounded corners
        padding: 10, // Tooltip padding
        callbacks: { // Custom formatting for tooltip content
          title: function(context: any) {
            return context[0].label; // Displays date
          },
          label: function(context: any) {
            let label = '';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label; 
          },
          labelPointStyle: () => ({ pointStyle: 'line' as const, rotation: 0 })
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true, 
          drawBorder: false, 
          color: 'rgba(55, 65, 81, 0.3)', 
        },
        ticks: {
          color: '#D1D5DB', 
          maxTicksLimit: 8, 
          autoSkipPadding: 10, 
        },
      },
      y: {
        grid: {
          display: true, 
          drawBorder: false, 
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#D1D5DB', 
          callback: function(value: string | number) {
            return '$' + value; 
          },
          maxTicksLimit: 7, 
        },
        position: 'right' as const, 
      },
    },
  };

  return (
    <div className="relative w-full h-80 md:h-96 mt-8 p-4 bg-[#080d1a] bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 flex items-center justify-center">
      {sortedData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p className="text-gray-400 text-xl">No historical data available for charting.</p>
      )}
    </div>
  );
};

export default PriceChart;