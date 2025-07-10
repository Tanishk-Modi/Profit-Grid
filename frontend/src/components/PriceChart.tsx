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
  isLosing: boolean;
  periodLabel?: string; // Add period label prop
}

const formatDateLabel = (dateStr: string, periodLabel: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const month = date.toLocaleString('en-US', { month: 'short' });
  if (periodLabel === '1M' || periodLabel === '3M') {
    return `${month} ${date.getDate()}`;
  }
  if (periodLabel === '1Y') {
    return month;
  }
  if (periodLabel === '5Y') {
    return date.getFullYear().toString();
  }
  // fallback
  return dateStr;
};

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, symbol, isLosing, periodLabel = '3M' }) => {
  // Prepare data for Chart.js
  const sortedData = [...priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format labels based on period
  const labels = sortedData.map((dataPoint) => formatDateLabel(dataPoint.date, periodLabel));
  const dataValues = sortedData.map((dataPoint) => dataPoint.close);

  const lineColor = isLosing ? '#F7525F' : '#10B981'; 
  const gradientStartColor = isLosing ? 'rgba(247, 82, 95, 0.3)' : 'rgba(16, 185, 129, 0.3)'; 
  const gradientEndColor = isLosing ? 'rgba(247, 82, 95, 0)' : 'rgba(16, 185, 129, 0)'; 


  const data = {
    labels: labels,
    datasets: [
      {
        label: `${symbol} Close Price`,
        data: dataValues,
        fill: 'start',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, gradientStartColor); 
          gradient.addColorStop(1, gradientEndColor);  
          return gradient;
        },
        borderColor: lineColor, 
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  // Chart.js plugin to hide x-axis labels on small screens except on tooltip/hover
  const hideXAxisLabelsOnMobile = {
    id: 'hideXAxisLabelsOnMobile',
    beforeDraw: (chart: any) => {
      if (window.innerWidth < 640) { // Tailwind's sm: 640px
        if (chart.options.scales?.x?.ticks) {
          chart.options.scales.x.ticks.display = false;
        }
      } else {
        if (chart.options.scales?.x?.ticks) {
          chart.options.scales.x.ticks.display = true;
        }
      }
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: lineColor, 
        borderWidth: 1,
        cornerRadius: 4,
        padding: 10,
        callbacks: {
          title: function(context: any) {
            // Show full date on tooltip
            const idx = context[0].dataIndex;
            const origDate = sortedData[idx]?.date;
            if (!origDate) return '';
            const date = new Date(origDate);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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
          maxTicksLimit: 6,
          autoSkipPadding: 10,
          display: true, // Will be toggled by plugin
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
            return '$' + parseFloat(value.toString()).toFixed(2);
          },
          maxTicksLimit: 5,
        },
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="relative w-full h-80 md:h-96 mt-8 p-4 bg-[#080d1a] bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 flex items-center justify-center">
      <style>
        {`
        @media (max-width: 639px) {
          .chartjs-x-labels {
            display: none !important;
          }
        }
        `}
      </style>
      {sortedData.length > 0 ? (
        <Line data={data} options={options} plugins={[hideXAxisLabelsOnMobile]} />
      ) : (
        <p className="text-gray-400 text-xl">No historical data available for charting.</p>
      )}
    </div>
  );
};

export default PriceChart;