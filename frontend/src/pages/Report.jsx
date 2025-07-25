import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { reportAPI } from '../service/api';
import Loading from '../components/Loading';
import Display from '../components/Display';
import { CreditCard, DollarSign, Scale } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const Report = () => {
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [categoryReport, setCategoryReport] = useState(null);
  const [balanceReport, setBalanceReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryPeriod, setCategoryPeriod] = useState('current')

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [monthly, category, balance] = await Promise.all([
          reportAPI.getMonthlyReports(),
          reportAPI.getCategoryReports(categoryPeriod),
          reportAPI.getBalanceReports(),
        ]);
        setMonthlyReport(monthly);
        setCategoryReport(category);
        setBalanceReport(balance);
      } catch (err) {
        setMonthlyReport(null);
        setCategoryReport(null);
        setBalanceReport(null);
      }
      setLoading(false);
    };
    fetchReports();
  }, [categoryPeriod]);

  // Prepare data for charts
  const chartColors = [
    '#0ea5e9', // Dark Sky Blue
    '#10b981', // Dark Emerald Green
    '#8b5cf6', // Dark Violet
    '#ec4899', // Dark Pink
    '#f97316', // Dark Orange
    '#eab308', // Dark Yellow
    '#14b8a6', // Dark Teal
    '#ef4444', // Dark Red
    '#4b5563', // Dark Gray
    '#6366f1', // Dark Indigo
    '#475569', // Dark Slate
    '#0891b2', // Dark Cyan
  ];
  const chartColorsLight = [
    '#e0f2fe', // Light Sky Blue
    '#d1fae5', // Light Emerald Green
    '#ede9fe', // Light Violet
    '#fce7f3', // Light Pink
    '#ffedd5', // Light Orange
    '#fef9c3', // Light Yellow
    '#ccfbf1', // Light Teal
    '#fee2e2', // Light Red
    '#f3f4f6', // Light Gray
    '#e0e7ff', // Light Indigo
    '#f1f5f9', // Light Slate
    '#cffafe', // Light Cyan
  ];

  const getBarData = () => {
    if (!monthlyReport) return {};
    const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
    const income = months.map((_, i) => monthlyReport[i]?.income || 0);
    const expense = months.map((_, i) => monthlyReport[i]?.expense || 0);
    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: income,
          backgroundColor: chartColors.map((_, i) => chartColors[i % chartColors.length]),
          borderColor: chartColors.map((_, i) => chartColors[i % chartColors.length]),
          borderRadius: 3
        },
        {
          label: 'Expense',
          data: expense,
          backgroundColor: chartColorsLight.map((_, i) => chartColorsLight[i % chartColorsLight.length]),
          borderColor: chartColorsLight.map((_, i) => chartColorsLight[i % chartColorsLight.length]),
          borderRadius: 3
        }
      ]
    };
  };


  const getCategoryBarData = () => {
    if (!categoryReport) return {};
    const labels = Object.keys(categoryReport);
    const data = Object.values(categoryReport);
    return {
      labels,
      datasets: [
        {
          label: 'Amount',
          data,
          backgroundColor: labels.map((_, i) => chartColors[i % chartColors.length]),
          borderColor: labels.map((_, i) => chartColors[i % chartColors.length]),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <Loading />
      </div>)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold  mb-6">Financial Report</h1>
        <>
          {balanceReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Display
                text1="Total Income"
                text2={balanceReport.income}
                Icon={DollarSign}
                type="income"
              />
              <Display
                text1="Total Expense"
                text2={balanceReport.expense}
                Icon={CreditCard}
                type="expense"
              />
              <Display
                text1="Net Balance"
                text2={balanceReport.balance}
                Icon={Scale}
                type="default"
              />
            </div>
          )}

          {/* Monthly Bar Chart */}
          <div className="bg-white rounded-lg border border-gray-200 shadow p-6 transition-all hover:shadow-xl hover:-translate-y-0.5">
            <h2 className="text-lg font-semibold mb-4">Monthly Income & Expense</h2>
            <div className="h-72 flex items-center justify-center">
              <Bar data={getBarData()} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          {/* Category Bar Chart */}
          <div className="bg-white rounded-lg border border-gray-200 shadow p-6 transition-all hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Category-wise Expense</h2>
              <select
                value={categoryPeriod}
                onChange={(e) => setCategoryPeriod(e.target.value)}
                className="p-2 rounded-md border border-gray-200 shadow-sm  focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="current">Current Month</option>
                <option value="3months">Past 3 Months</option>
                <option value="6months">Past 6 Months</option>
              </select>
            </div>
            <div className="h-72 flex items-center justify-center">
              <Bar data={getCategoryBarData()} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default Report;