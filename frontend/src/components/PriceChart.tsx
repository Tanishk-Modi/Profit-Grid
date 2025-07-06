import React from 'react'
import { Line } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
    priceHistory: { date: string, close: number } [];
    symbol: string
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, symbol} ) => {

    const sortedData = [...priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = sortedData.map((dataPoint) => dataPoint.date);
    const dataValues = sortedData.map((dataPoint) => dataPoint.close);

    const data = {
        labels: labels, 
        datasets: [
            {
                label: `${symbol} Close Price`,
                data: dataValues,
                fill: false,
                borderColor: '#10B981',
                tension: 0.1, // Smoothness of the line
                pointRadius: 2, // Size of data points
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#10B981',
                pointHoverRadius: 4,
                borderWidth: 2,
            },
        ],
    };

    const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows you to control height with Tailwind classes
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#D1D5DB', // gray-300 for legend text
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `${symbol} Daily Closing Price`,
        color: '#F9FAFB', // gray-50 for title text
        font: {
          size: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800 with opacity
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: '#10B981',
        borderWidth: 1,
        cornerRadius: 4,
        padding: 10,
        callbacks: {
          title: function(context: any) {
            return context[0].label; // Displays the date
          },
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)', // gray-700 with opacity for x-axis grid lines
          borderColor: '#4B5563', // gray-600 for axis line
        },
        ticks: {
          color: '#D1D5DB', // gray-300 for x-axis labels
          maxTicksLimit: 10, // Limit number of ticks to prevent clutter
        },
      },
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)', // gray-700 with opacity for y-axis grid lines
          borderColor: '#4B5563', // gray-600 for axis line
        },
        ticks: {
          color: '#D1D5DB', // gray-300 for y-axis labels
          callback: function(value: string | number) {
            return '$' + value; // Format y-axis labels as currency
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-80 md:h-96 mt-8 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 flex items-center justify-center">
      {sortedData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p className="text-gray-400 text-xl">No historical data available for charting.</p>
      )}
    </div>
  );

};

export default PriceChart