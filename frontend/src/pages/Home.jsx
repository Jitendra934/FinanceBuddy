import { Banknote, ChartColumn, CirclePlus, Filter, ReceiptText, RefreshCw } from "lucide-react"
import toast from 'react-hot-toast'
import Display from "../components/Display"
import Visual from "../components/Visual"
import DoughnutChart from "../components/DoughnutChart"
import Linechart from "../components/LineChartt"
import RecentTransaction from "../components/RecentTransaction"
import AddTransaction from "../components/AddTransaction"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { reportAPI, transactionAPI } from "../service/api"
import Loading from "../components/Loading"
import LineChart from "../components/LineChartt"
import { formatCurrency } from "../lib/formatCurrency"

const generateRandomColors = (length, theme) => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#00C49F', '#FF6666',
    '#ec4899', '#d946ef'
  ];

  return Array.from({ length }, (_, i) => colors[i % colors.length]);
}

const Home = () => {

  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false)
  const [monthlyBalance, setMonthlyBalance] = useState({
    income: 0,
    expense: 0,
    MonthIncomeDiff: 0,
    MonthExpenseDiff: 0
  })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const [recentTransactions, setRecentTransactions] = useState([])
  const [categoryData, setCategoryData] = useState(null)
  const [monthlyChartData, setMonthlyChartData] = useState(null)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate();

  const [categoryPeriod, setCategoryPeriod] = useState('current')

  const handleAddTransactionClick = () => {
    setShowAddTransactionForm(true)
  }

  const handleCloseModal = () => {
    setShowAddTransactionForm(false)
  }

  const handleSubmitTransaction = async (transaction) => {
    try {
      const response = await transactionAPI.createTransaction(transaction);
      toast.success('Transaction created successfully');

      await fetchAllData()
      setShowAddTransactionForm(false)
    } catch (error) {
      toast.error('Error creating transaction', error)
      throw error
    }
  }

  const handleMonthlyData = async () => {
    try {
      const response = await reportAPI.getMonthlyReports();
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const currentMonthData = response[currentMonth]
      const responseLength = Object.keys(response).length
      const prevMonthData = responseLength > 1 ? response[currentMonth - 1] : null;
      
      if (prevMonthData) {
        const IncomeDiff = (currentMonthData?.income || 0) - (prevMonthData?.income || 0);
        const ExpenseDiff = (currentMonthData?.expense || 0) - (prevMonthData?.expense || 0);
        setMonthlyBalance({
          income: currentMonthData?.income || 0,
          expense: currentMonthData?.expense || 0,
          MonthIncomeDiff: IncomeDiff,
          MonthExpenseDiff: ExpenseDiff
        })
      } else {
        setMonthlyBalance({
          income: currentMonthData?.income || 0,
          expense: currentMonthData?.expense || 0,
          MonthIncomeDiff: 0,
          MonthExpenseDiff: 0
        })
      }

      const sortedMonths = Object.keys(response).sort((a, b) => a - b)
      const labels = sortedMonths.map((monthNumber) => {
        return new Date(currentYear, parseInt(monthNumber)).toLocaleString('default', {
          month: 'short'
        })
      });
      
      const incomeData = sortedMonths.map((monthNumber) => response[monthNumber]?.income || 0)
      const expenseData = sortedMonths.map((monthNumber) => response[monthNumber]?.expense || 0)
      
      const chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expense',
            data: expenseData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      }
      
      setMonthlyChartData(chartData)
    } catch (error) {
      toast.error('Error fetching monthly data:', error)
      throw error
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      const recentTransaction = response.data?.slice(0, 5) || []
      setRecentTransactions(recentTransaction)
    } catch (error) {
      toast.error('Error fetching recent transactions:', error)
      throw error
    }
  }

  const fetchCategoryData = async (period = 'current') => {
    try {
      const expense = await reportAPI.getCategoryReports(period);
      
      if (!expense || Object.keys(expense).length === 0) {
        setCategoryData({
          labels: ['No Data'],
          datasets: [{
            label: 'Monthly Expense',
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderColor: '#fff',
            borderWidth: 1
          }]
        })
        return;
      }
      
      const data = {
        labels: Object.keys(expense),
        datasets: [
          {
            label: 'Monthly Expense',
            data: Object.values(expense),
            backgroundColor: generateRandomColors(Object.keys(expense).length),
            borderColor: '#fff',
            borderWidth: 1
          }
        ]
      }
      setCategoryData(data)
    } catch (error) {
      toast.error('Error fetching category data:', error)
      throw error
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all data in parallel
      await Promise.all([
        handleMonthlyData(),
        fetchRecentTransactions(),
        fetchCategoryData(categoryPeriod)
      ])
    } catch (error) {
      toast.error('Error fetching dashboard data', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  const handleCategoryPeriodChange = async (newPeriod) => {
    setCategoryPeriod(newPeriod)
    setLoading(true)
    try {
      await fetchCategoryData(newPeriod)
    } catch (error) {
      toast.error('Error fetching category data', error)
      setError('Failed to load category data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchAllData}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
    <div className='min-h-screen flex justify-center items-center bg-white dark:bg-gray-900'>
      <Loading />
    </div>)
  }

  return (
    <div className="p-4 sm:pl-9 sm:pr-12 space-y-6 sm:space-y-8 max-w-full bg-white min-h-screen transition-colors duration-200">
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row lg:justify-between md:items-center pt-4">
        <div className="flex-shrink-0">
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-800 leading-tight">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-3 sm:gap-x-3 sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex justify-center items-center gap-2 text-neutral-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-4 py-2.5 border border-gray-300 rounded-md transition-colors duration-200 w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium whitespace-nowrap">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
          
          <button
            onClick={handleAddTransactionClick}
            className="flex justify-center items-center gap-2 text-neutral-800 bg-white hover:bg-gray-50 active:bg-gray-100 px-4 py-2.5 border border-stone-400 rounded-md transition-colors duration-200 w-full sm:w-auto">
            <CirclePlus className="w-4 h-4 text-neutral-800 flex-shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">Add New Transaction</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex justify-center items-center gap-2 text-white bg-indigo-500 hover:bg-indigo-600 focus:bg-indigo-700 active:bg-indigo-700 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 border-none rounded-md transition-all duration-200 w-full sm:w-auto">
            <ChartColumn className="w-4 h-4 text-white flex-shrink-0" />
            <p className="text-sm font-medium text-white whitespace-nowrap">View All Reports</p>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
        <Display 
          text1={'Monthly Income'} 
          text2={`${monthlyBalance.income}`} 
          text3={monthlyBalance.MonthIncomeDiff > 0
            ? `Up by ₹${monthlyBalance.MonthIncomeDiff.toLocaleString()}`
            : monthlyBalance.MonthIncomeDiff < 0
              ? `Down by ₹${formatCurrency(Math.abs(monthlyBalance.MonthIncomeDiff))}`
              : 'No change from last month'} 
          Icon={Banknote}
          type="income"
         />
        <Display 
          text1={'Monthly Expenses'}
          text2={`${monthlyBalance.expense}`} 
          text3={monthlyBalance.MonthExpenseDiff < 0 
            ? `Down by ${Math.abs(monthlyBalance.MonthExpenseDiff)}` 
            : monthlyBalance.MonthExpenseDiff > 0 
              ? `Up by ${formatCurrency(monthlyBalance.MonthExpenseDiff)}` 
              : 'No change from last month'} 
          Icon={ReceiptText} 
          type="expense"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Visual 
          heading={
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-semibold text-gray-900">
                Spending Breakdown by Category
              </span>
              <div className="relative flex items-center">
                <select
                  value={categoryPeriod}
                  onChange={(e) => handleCategoryPeriodChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="current">Current Month</option>
                  <option value="3months">Past 3 Months</option>
                  <option value="6months">Past 6 Months</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Filter className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          } 
          Component={() => <DoughnutChart data={categoryData} />} 
        />
        
        <Visual 
          heading={<span className="text-lg font-semibold text-gray-900">Income vs Expense Trend</span>} 
          Component={() => <LineChart data={monthlyChartData} />} 
        />
        
        <div className="lg:col-span-2">
          <Visual 
            heading={<span className="text-xl font-semibold text-gray-900">Recent Transactions</span>} 
            Component={() => <RecentTransaction transactions={recentTransactions} />} 
          />
        </div>
      </div>

      {showAddTransactionForm && (
        <AddTransaction 
          isOpen={showAddTransactionForm} 
          onClose={handleCloseModal} 
          onSubmit={handleSubmitTransaction} 
        />
      )}
    </div>
  )
}


export default Home