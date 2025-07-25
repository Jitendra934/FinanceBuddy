import { memo, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { reportAPI } from '../service/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = memo(({ data }) => {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }))

  if (!data) return <p className='text-neutral-800 font-semibold text-sm'>No data available</p>;

  return (
    <div className='w-full max-w-sm h-64 sm:h-72 md:h-80'>
      <Doughnut data={data} options={options} />
    </div>
  )
})

export default DoughnutChart;

