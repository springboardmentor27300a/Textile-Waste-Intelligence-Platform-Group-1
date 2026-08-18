import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RecyclingCategoriesBarChart = ({ data }) => {
  const labels = data ? Object.keys(data) : [];
  const values = data ? Object.values(data) : [];

  if (labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
        No recycling category data available
      </div>
    );
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Quantity (kg)',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.85)', // Blue-500
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1.5,
        borderRadius: 4,
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default RecyclingCategoriesBarChart;
