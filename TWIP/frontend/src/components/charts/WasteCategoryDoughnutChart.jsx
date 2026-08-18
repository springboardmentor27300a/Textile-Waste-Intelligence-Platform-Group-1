import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const WasteCategoryDoughnutChart = ({ data }) => {
  const labels = data ? Object.keys(data) : [];
  const values = data ? Object.values(data) : [];

  if (labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
        No category breakdown available
      </div>
    );
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',  // emerald-500
          'rgba(59, 130, 246, 0.85)',   // blue-500
          'rgba(245, 158, 11, 0.85)',   // amber-500
          'rgba(239, 68, 68, 0.85)',     // red-500
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Outfit', size: 10 },
          boxWidth: 12
        },
      },
      tooltip: {
        bodyFont: { family: 'Outfit' },
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${val.toLocaleString()} kg`;
          }
        }
      }
    },
    cutout: '60%'
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default WasteCategoryDoughnutChart;
