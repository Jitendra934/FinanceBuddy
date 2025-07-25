import { Calendar, ChevronDown, ChevronUp, CreditCard, DollarSign, EditIcon, IndianRupee, PiggyBank, SearchIcon, Tag, Trash2, X } from 'lucide-react';
import React, { useEffect } from 'react';
import Display from '../components/Display';
import Loading from '../components/Loading';
import { dateFormat } from '../lib/dateFormat';
import { formatCurrency } from '../lib/formatCurrency';
import useTransactionStore from '../store/useTransactionStore';

const options = ['Food', 'Grocery', 'Entertainment', 'Transport', 'Bill', 'Miscellaneous', 'All', 'Salary'];

const categories = {
  'INCOME': ['Salary', 'Business', 'Freelance', 'Investment', 'Other Incomes'],
  'EXPENSE': ['Food', 'Transportation', 'Entertainment', 'Grocery', 'Shopping', 'HealthCare', 'Bills', 'Education', 'Other Expenses']
};

const Transaction = () => {
  const {
    // State
    transactionData,
    filteredTransactions,
    currentPage,
    totalPages,
    loading,
    error,
    filters,
    optionOpen,
    categoryDropdown,
    updateTransactionModal,
    amount,
    currentTransactionData,
    updatedTransaction,

    // Actions
    setFilters,
    clearFilters,
    setOptionOpen,
    setCategoryDropdown,
    setUpdatedTransaction,
    filterTransactions,
    fetchTransactions,
    fetchDisplayData,
    deleteTransaction,
    updateTransaction,
    handlePageChange,
    handleOptionSelect,
    openUpdateModal,
    closeUpdateModal,
  } = useTransactionStore();

  // Initialize data on component mount
  useEffect(() => {
    fetchDisplayData();
    fetchTransactions();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    if (transactionData.length > 0) {
      filterTransactions();
    }
  }, [filters, transactionData]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (currentTransactionData) {
      try {
        await updateTransaction(currentTransactionData.id);
      } catch (error) {
        console.error('Error updating transaction:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <Loading />
      </div>)
  }

  return (
    <div className='p-4 sm:pl-9 sm:pr-12 max-w-full overflow-x-hidden bg-gray-50'>
      <div className='pt-4 w-full'>
        <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-8'>
          <div className='flex-shrink-0 mb-2'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl leading-tight font-bold text-neutral-800'>
              Transaction<br className='hidden sm:block' /> History
            </h1>
          </div>

          <div className='flex flex-col w-full lg:w-auto'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4'>

              <div className='flex flex-col '>
                <label className='text-sm font-medium text-stone-400 mb-1'>From</label>

                <div className='relative flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full transition-colors duration-200'>
                  <input
                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    type='date'
                    value={filters.fromDate}
                    placeholder='Select a date'
                    className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent'
                  />
                </div>
              </div>

              <div className='flex flex-col'>
                <label className='text-sm font-medium text-stone-400 mb-1'>To</label>

                <div className='flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full transition-colors duration-200'>
                  <input
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    type='date'
                    value={filters.toDate}
                    placeholder='Select a date'
                    className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent'
                  />
                </div>
              </div>

              <div className='flex flex-col'>
                <label className='text-sm font-medium text-stone-400 mb-1'>Category</label>
                <div className='relative flex items-center'>
                  <input
                    onChange={(e) => handleFilterChange('selectCategory', e.target.value)}
                    type='text'
                    value={filters.selectCategory}
                    placeholder='All'
                    className='w-full text-sm rounded-md border border-gray-200 hover:bg-gray-50 px-3 py-2.5 bg-white text-neutral-800 outline-none pr-8 transition-colors duration-200'
                  />
                  <button
                    onClick={() => setOptionOpen(!optionOpen)}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer'
                  >
                    {optionOpen ? (
                      <ChevronUp className='w-4 h-4 text-neutral-800' />
                    ) : (
                      <ChevronDown className='w-4 h-4 text-neutral-800' />
                    )}
                  </button>

                  {optionOpen && (
                    <div className='z-10 fixed inset-0' onClick={() => setOptionOpen(false)} />
                  )}

                  {optionOpen && (
                    <ul className='absolute z-20 top-full left-0 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto'>
                      {options.map(option => (
                        <li
                          key={option}
                          onClick={() => handleOptionSelect(option)}
                          className='px-4 py-3 hover:bg-gray-100 cursor-pointer'
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className='flex flex-col'>
                <label className='text-sm font-medium text-stone-400 mb-1'>Min Amount</label>
                <input
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  type='number'
                  placeholder='0'
                  value={filters.minAmount}
                  className='w-full text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 px-3 py-2.5 bg-white outline-none transition-colors duration-200'
                />
              </div>

              <div className='flex flex-col'>
                <label className='text-sm font-medium text-stone-400 mb-1'>Max Amount</label>
                <input
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  type='number'
                  placeholder='1000'
                  value={filters.maxAmount}
                  className='w-full text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 px-3 py-2.5 bg-white outline-none transition-colors duration-200'
                />
              </div>

              <div className='flex flex-col'>
                <label className='text-sm font-medium text-stone-400 mb-1'>Search</label>
                <div className='flex items-center border border-stone-400 rounded-md px-3 py-2.5 bg-white hover:border-indigo-400 transition-colors duration-200'>
                  <SearchIcon className='w-4 h-4 text-stone-400 flex-shrink-0' />
                  <input
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    type='text'
                    placeholder='Search transactions'
                    value={filters.searchQuery}
                    className='outline-none text-sm font-normal bg-transparent pl-2 w-full min-w-0'
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-start gap-4'>
              <button
                onClick={clearFilters}
                className='flex justify-center items-center text-sm font-medium text-stone-400 rounded-md border border-gray-200 px-4 py-2.5 hover:bg-gray-50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md'
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className='pt-6 sm:pt-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 flex-wrap gap-4 sm:gap-6'>
            <Display text1={`Total Income(${amount.currentMonthName})`} text2={amount.income} Icon={DollarSign} />
            <Display text1={`Total Expense(${amount.currentMonthName})`} text2={amount.expense} Icon={CreditCard} />
            <Display text1={`Net Balance(${amount.currentMonthName})`} text2={amount.balance} Icon={PiggyBank} />
          </div>
        </div>

        <div className='mt-6 sm:mt-8 rounded-lg border border-gray-200 shadow-sm bg-white transition-shadow duration-300 hover:shadow-xl'>
          <div className='p-4 sm:p-6'>
            <div className='mb-4'>
              <h2 className='font-semibold text-lg sm:text-xl text-neutral-800 leading-7'>All Transactions</h2>
              <p className='text-sm font-normal leading-5 text-stone-400 mt-1'>
                A comprehensive log of all your financial transactions
              </p>
            </div>

            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full mt-4'>
                <thead>
                  <tr className='border-b-2 border-b-gray-200'>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Date</th>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Description</th>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Category</th>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Type</th>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Amount</th>
                    <th className='text-sm font-semibold text-neutral-700 text-left py-3.5'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (

                    <tr key={transaction.id} className='border-b border-gray-100 hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:-translate-y-0.5'>
                      <td className='py-3 text-[16px] text-neutral-800'>{dateFormat(transaction.date)}</td>
                      <td className='py-3 text-[16px] text-neutral-800 font-medium'>{transaction.note}</td>
                      <td className='py-3 text-[16px] text-gray-600'>{transaction.category.name}</td>
                      <td className={`py-3 text-[16px] font-medium ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {transaction.type}
                      </td>
                      <td className={`py-3 text-[16px] ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className='flex items-center py-3 gap-x-2.5'>

                        <button
                          onClick={() => openUpdateModal(transaction.id)}
                          className='p-2 bg-white hover:bg-gray-100 rounded-md transition-transform duration-200 hover:scale-110'
                        >
                          <EditIcon className='w-4 h-4 text-blue-400' />
                        </button>

                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className='p-2 bg-white hover:bg-gray-100 rounded-md transition-transform duration-200 hover:scale-110'
                        >
                          <Trash2 className='w-4 h-4 text-red-400' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='lg:hidden space-y-4 mt-4'>
              {filteredTransactions.map(transaction => (

                <div key={transaction.id} className='border border-gray-300 p-4 rounded-lg bg-gray-50 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md'>
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='font-medium text-neutral-800'>{transaction.note}</p>
                      <p className='text-sm text-gray-500'>{dateFormat(transaction.date)}</p>
                    </div>
                    <p className={`text-sm ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-500'>{transaction.category.name} • {transaction.type}</span>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => openUpdateModal(transaction.id)}
                        className='p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-transform duration-200 hover:scale-110 flex items-center gap-1.5'
                      >
                        <EditIcon className='w-4 h-4 text-blue-400' />
                        <span className='text-sm font-medium text-gray-900'>Update</span>
                      </button>

                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className='p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-transform duration-200 hover:scale-110 flex items-center gap-1.5'
                      >
                        <Trash2 className='w-4 h-4 text-red-400' />
                        <span className='text-sm font-medium text-gray-900'>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4'>
              <p className='text-sm font-normal text-stone-400'>
                Showing {filteredTransactions.length} of {transactionData.length} transactions
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border rounded-md text-sm transition-all duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:-translate-y-0.5'}`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-2 border rounded-md text-sm transition-all duration-200 ${currentPage === index + 1 ? 'bg-indigo-400 text-white' : 'hover:bg-gray-100 hover:-translate-y-0.5'}`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border rounded-md text-sm transition-all duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:-translate-y-0.5'}`}
                >
                  Next
                </button>
              </div>
            </div>

            {updateTransactionModal && (
              <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-semiboldtext-neutral-800'>Update Transaction</h2>
                    <button
                      onClick={closeUpdateModal}
                      className='rounded-full px-3 py-2 bg-white hover:bg-gray-100 transition-colors'>
                      <X className='w-6 h-6 text-stone-400' />
                    </button>
                  </div>

                  <div className='space-y-4'>
                    <form onSubmit={handleUpdateSubmit} className='space-y-4'>

                      <div className='flex flex-col'>
                        <label className='text-sm font-medium text-stone-400 mb-1'>Transaction Type</label>
                        <div className='flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                          <select
                            value={updatedTransaction.type}
                            onChange={(e) => setUpdatedTransaction({ type: e.target.value })}
                            className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent'>
                            <option value='INCOME'>INCOME</option>
                            <option value='EXPENSE'>EXPENSE</option>
                          </select>
                        </div>
                      </div>

                      <div className='flex flex-col'>
                        <label className='text-sm font-medium text-stone-400 mb-1'>Amount</label>
                        <div className='flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                          <IndianRupee className='w-4 h-4 text-stone-400 flex-shrink-0' />
                          <input
                            type='number'
                            placeholder='Enter amount'
                            value={parseFloat(updatedTransaction.amount)}
                            onChange={(e) => setUpdatedTransaction({ amount: e.target.value })}
                            className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent' />
                        </div>
                      </div>

                      <div className='relative flex flex-col'>
                        <label className='text-sm font-medium text-stone-400 mb-1'>Category</label>
                        <div className='relative flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                          <input
                            type='text'
                            placeholder={updatedTransaction.type ? 'Select a category' : 'Select a type first'}
                            value={updatedTransaction.categoryName}
                            readOnly
                            onClick={() => updatedTransaction.type && setCategoryDropdown(!categoryDropdown)}
                            className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent'
                          />
                          <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 cursor-pointer' />
                        </div>

                        {categoryDropdown && updatedTransaction.type && (
                          <ul className='absolute z-40 top-full left-0 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto'>
                            {categories[updatedTransaction.type].map(category => (
                              <li key={category}
                                onClick={() => { setUpdatedTransaction({ categoryName: category }); setCategoryDropdown(false); }}
                                className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'>
                                <Tag className='w-4 h-4 text-gray-400' />
                                {category}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className='flex flex-col'>
                        <label className='text-sm font-medium text-stone-400 mb-1'>Description</label>
                        <div className='flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                          <input
                            type='text'
                            placeholder='Enter description'
                            value={updatedTransaction.note}
                            onChange={(e) => setUpdatedTransaction({ note: e.target.value })}
                            className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent' />
                        </div>
                      </div>

                      <div className='flex flex-col'>
                        <label className='text-sm font-medium text-stone-400 mb-1'>Date</label>
                        <div className='relative flex items-center text-neutral-800 text-sm rounded-md border border-gray-200 hover:bg-gray-50 gap-2 px-3 py-2.5 bg-white w-full'>
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type='date'
                            value={updatedTransaction.date}
                            onChange={(e) => setUpdatedTransaction({ date: e.target.value })}
                            className='flex-1 truncate placeholder:text-stone-400 outline-none bg-transparent pl-6' />
                        </div>
                      </div>
                      <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200'>
                        <button
                          type='button'
                          onClick={closeUpdateModal}
                          className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset focus:ring-blue-500 transition-colors'>
                          Cancel
                        </button>

                        <button
                          type='submit'
                          disabled={!updatedTransaction.note || !updatedTransaction.amount || !updatedTransaction.categoryName || !updatedTransaction.type}
                          className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset focus:ring-blue-500 transition-colors'>
                          Update Transaction
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

  )
}

export default Transaction


