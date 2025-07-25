import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../lib/formatCurrency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BudgetLineChart = ({ data }) => {
  const [loading] = useState(false);

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Budgeted',
        data: data.map(item => item.budgeted),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Actual',
        data: data.map(item => item.actual),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
      }
    ]
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
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  if(loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500 ">Loading...</div>;
  }

  if (!chartData) return null;

  return (
    <div className='w-full max-w-sm h-64 sm:h-72 md:h-80'>
      <Line data={chartData} options={options} />
    </div>
  )
};

export default BudgetLineChart;
