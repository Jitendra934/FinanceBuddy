import { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  scales
} from 'chart.js';
import axios from 'axios';
import { reportAPI } from '../service/api';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const LineChart = memo(({ data }) => {
  const options = useMemo(() => (
    {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      }
    }
  }
  ))

  if (!data) return <p className='text-sm font-semibold text-neutral-800'>No data available</p>;

  return (
    <div className='w-full max-w-lg h-60 sm:h-64 md:h-72'>
      <Line data={data} options={options} />
    </div>
  )
})

export default LineChart;