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

const CarbonTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
        No trend telemetry available
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'CO₂ Saved (kg)',
        data: data.map(d => d.value),
        fill: false,
        borderColor: 'rgb(16, 185, 129)', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.2,
        borderWidth: 3,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointRadius: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        bodyFont: { family: 'Outfit' },
        titleFont: { family: 'Outfit' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { family: 'Outfit', size: 10 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Outfit', size: 10 }
        }
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CarbonTrendChart;
