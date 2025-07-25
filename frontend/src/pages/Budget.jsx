import { useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Plus, Edit2, Trash2, AlertCircle, Target, X, EditIcon, Tag, ChevronDown, AlertTriangle } from 'lucide-react';
import BudgetLineChart from '../components/BudgetLineChart';
import BudgetProgress from '../components/BudgetProgress';
import useBudgetStore from '../store/useBudgetStore';
import { formatCurrency } from '../lib/formatCurrency';
import Loading from '../components/Loading';

const Budget = () => {
  const {
    budgets,
    balanceReport,
    showNewBudgetModal,
    newBudget,
    currentMonth,
    currentYear,
    updateBudgetModal,
    currentBudgetUpdate,
    updatedBudget,
    categoryDropdown,
    categories,
    setShowNewBudgetModal,
    setCategoryDropdown,
    setCurrentMonth,
    setCurrentYear,
    setNewBudget,
    setUpdateBudgetModal,
    setUpdatedBudget,
    fetchBudgetData,
    getBudgetComparison,
    getMonthlyTrendData,
    handleCreateBudget,
    handleDeleteBudget,
    handleBudgetUpdate,
    handleUpdateSubmit,
    getStatusColor,
    getStatusIcon,
    loading
  } = useBudgetStore();

  useEffect(() => {
    fetchBudgetData();
  }, [currentMonth, currentYear]);

  const currentMonthBudgets = budgets.filter(budget =>
    budget && budget.month === currentMonth && budget.year === currentYear
  );

  const budgetComparison = getBudgetComparison();
  const monthlyTrendData = getMonthlyTrendData();

  const renderStatusIcon = (status) => {
    if (status === 'warning') return <AlertTriangle className='w-4 h-4 text-red-500' />
    if (status === 'alert') return <AlertCircle className="w-4 h-4 text-orange-500" />;
    if (status === 'trending') return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <Target className="w-4 h-4 text-emerald-500" />;
  };

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <Loading />
      </div>)
  }


  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-lg shadow p-6 transition-shadow duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Budget Overview</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={2023 + i} value={2023 + i}>
                        {2023 + i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-blue-50 rounded-lg p-4 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Budgeted</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(balanceReport.income)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(balanceReport.expense)}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className={`text-2xl font-bold ${balanceReport.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(balanceReport.balance)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Categories Table */}

            <div className="bg-white rounded-lg shadow overflow-hidden transition-shadow duration-300 hover:shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Budget Categories</h2>

                  <button
                    onClick={() => setShowNewBudgetModal(true)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {currentMonthBudgets.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <p className="text-lg mb-2">No budgets set for {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}</p>
                    <p className="text-sm">Click "Add Category" to create your first budget for this month.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentMonthBudgets.map((budget) => {
                        const comparison = budgetComparison[budget.category.name];
                        const percentage = comparison ? comparison.percentage : 0;

                        return (

                          <tr key={budget.id} className="hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:-translate-y-0.5">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{budget.category.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">Monthly</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ₹{comparison ? comparison.actual : 0} / {formatCurrency(budget.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {renderStatusIcon(getStatusIcon(percentage))}
                                <span className={`text-sm ${getStatusColor(percentage)}`}>
                                  {Math.min(percentage.toFixed(0), 100)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">

                                <button
                                  onClick={() => handleBudgetUpdate(budget.id)}
                                  className="p-2 bg-white hover:bg-gray-100 rounded-md transition-transform duration-200 hover:scale-110">
                                  <EditIcon className="w-4 h-4 text-blue-400" />
                                </button>

                                <button
                                  onClick={() => handleDeleteBudget(budget.id)}
                                  className="p-2 bg-white hover:bg-gray-100 rounded-md transition-transform duration-200 hover:scale-110"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Budget Trend */}
          <div className="space-y-6">

            <div className="bg-white rounded-lg shadow p-6 transition-shadow duration-300 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Monthly Budget Trend</h3>
              <div className="h-80 flex items-center justify-center">
                <BudgetLineChart data={monthlyTrendData} />
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Budgeted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Actual</span>
                </div>
              </div>
              {monthlyTrendData.length > 12 && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Showing {monthlyTrendData.length} months of data
                </div>
              )}
            </div>

            {/* Progress Overview */}

            <div className="bg-white rounded-lg shadow p-6 transition-shadow duration-300 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
              {currentMonthBudgets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No budget progress to show for this month.</p>
                </div>
              ) : (
                <BudgetProgress budgetComparison={budgetComparison} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Budget Modal */}
      {showNewBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Set New Budget</h3>
            </div>
            <div className="p-6 space-y-4">

              <div className='relative '>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <div className='relative'>
                  <input
                    type="text"
                    value={newBudget.categoryName}
                    readOnly
                    onClick={() => setCategoryDropdown(!categoryDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Select a category"
                  />
                  <ChevronDown className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 cursor-pointer' />
                </div>

                {categoryDropdown && (
                  <ul className='absolute z-40 top-full left-0 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto'>
                    {categories.map(category => (
                      <li key={category}
                        onClick={() => { setNewBudget({ ...newBudget, categoryName: category }); setCategoryDropdown(false); }}
                        className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'>
                        <Tag className='w-4 h-4 text-gray-400' />
                        {category}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Amount (₹)</label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={newBudget.month}
                    onChange={(e) => setNewBudget({ ...newBudget, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={newBudget.year}
                    onChange={(e) => setNewBudget({ ...newBudget, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={2023 + i} value={2023 + i}>
                        {2023 + i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewBudgetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBudget}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {updateBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full">
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-semiboldtext-neutral-800'>Update Budget</h2>
              <button
                onClick={() => setUpdateBudgetModal(false)}
                className='rounded-full px-3 py-2 bg-white hover:bg-gray-100 transition-colors'>
                <X className='w-6 h-6 text-stone-400' />
              </button>
            </div>
            <div className='space-y-4'>
              <form onSubmit={(e) => handleUpdateSubmit(e, currentBudgetUpdate.id)} className='space-y-4'>

                <div className='relative flex flex-col'>
                  <label className='text-sm font-medium text-stone-400 mb-1'>Category Name</label>
                  <div className='relative flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                    <input
                      type='text'
                      placeholder='Enter category name'
                      value={updatedBudget.categoryName}
                      readOnly
                      onClick={() => setCategoryDropdown(!categoryDropdown)}
                      className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent'
                    />
                    <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 cursor-pointer' />
                  </div>
                  {categoryDropdown && (
                    <ul className='absolute z-40 top-full left-0 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto'>
                      {categories.map(category => (
                        <li key={category}
                          onClick={() => { setUpdatedBudget({ ...updatedBudget, categoryName: category }); setCategoryDropdown(false); }}
                          className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'>
                          <Tag className='w-4 h-4 text-gray-400' />
                          {category}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-sm font-medium text-stone-400 mb-1'>Allocated Amount</label>
                  <div className='flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                    <input
                      type='number'
                      placeholder='Enter amount'
                      value={updatedBudget.amount}
                      onChange={(e) => setUpdatedBudget({ ...updatedBudget, amount: parseFloat(e.target.value) })}
                      className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent' />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className='flex flex-col'>
                    <label className=" text-sm font-medium text-gray-400 mb-1">Month</label>
                    <select
                      value={updatedBudget.month}
                      onChange={(e) => setUpdatedBudget({ ...updatedBudget, month: parseInt(e.target.value) })}
                      className="flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex flex-col'>
                    <label className=" text-sm font-medium text-gray-400 mb-1">Year</label>
                    <select
                      value={updatedBudget.year}
                      onChange={(e) => setUpdatedBudget({ ...updatedBudget, year: parseInt(e.target.value) })}
                      className="flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={2023 + i} value={2023 + i}>
                          {2023 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => setUpdateBudgetModal(false)}
                    className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset focus:ring-blue-500 transition-colors'>
                    Cancel
                  </button>

                  <button
                    type='submit'
                    className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset focus:ring-blue-500 transition-colors'>
                    Update Budget
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Budget