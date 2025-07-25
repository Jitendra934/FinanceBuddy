import { Banknote, Calendar, ChevronDown, FileText, IndianRupee, ReceiptText, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const AddTransaction = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: 0.00,
    categoryName: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [dropdowns, setDropdowns] = useState({
    type: false,
    categoryName: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);

      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const types = ['INCOME', 'EXPENSE']
  const categories = {
    'INCOME': ['Salary', 'Business', 'Freelance', 'Investment', 'Other Incomes'],
    'EXPENSE': ['Food', 'Transportation', 'Entertainment', 'Grocery', 'Shopping', 'HealthCare', 'Bills', 'Education', 'Other Expenses']
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.amount || !formData.date || !formData.categoryName ) {
      setError('Please fill in required fields')
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return;
    }

    try {
      setLoading(true)
      setError('')

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      await onSubmit(transactionData)

      setFormData({
        type: '',
        amount: '',
        categoryName: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      })
      onClose();
    } catch (error) {
      setError('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        categoryName: ''
      }))
    }

    setError('')
  }

  const handleDropdownToggle = (dropdown) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }))
  }

  const handleDropdownSelect = (dropdown, value) => {
    handleInputChange(dropdown, value)
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: false
    }))
  }

  const handleBackDropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div onClick={handleBackDropClick} className='fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4'>
       <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200'>
        <div className='flex justify-between items-center p-4 sm:p-6 border-b border-gray-200'>
          <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>Create New Transaction</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-4 sm:p-6'>
          {error && (
            <div className='mb-4 bg-red-50 border border-red-200 rounded-md p-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div className='space-y-4'>
            <div className='relative'>
              <label className='block text-sm text-gray-700 font-medium mb-2'>
                Transaction Type *
              </label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Select transaction type'
                  value={formData.type}
                  readOnly
                  onClick={() => handleDropdownToggle('type')}
                  className='w-full text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 pr-10 bg-white text-gray-900 cursor-pointer'
                />
                <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>

              {dropdowns.type && (
                <>
                  <div className='fixed inset-0 z-40' onClick={() => handleDropdownToggle('type')} />
                  <ul className='absolute top-full left-0 z-50 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg'>
                    {types.map(option => (
                      <li
                        key={option}
                        onClick={() => handleDropdownSelect('type', option)}
                        className='px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm cursor-pointer text-gray-900'
                      >
                        {option === 'INCOME' ?
                          <Banknote className='w-4 h-4 text-green-500' />
                          :
                          <ReceiptText className='w-4 h-4 text-red-500' />
                        }
                        {option}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Amount *
              </label>
              <div className='relative'>
                <IndianRupee className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='number'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className='w-full text-sm rounded-lg bg-white border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 pl-8 text-gray-900'
                  step='0.01'
                  min='0'
                />
              </div>
            </div>

            <div className='relative'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category *
              </label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder={formData.type ? 'Select Category' : 'Select a type first'}
                  value={formData.categoryName}
                  readOnly
                  onClick={() => formData.type && handleDropdownToggle('categoryName')}
                  className={`w-full text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 pr-10 text-gray-900 ${formData.type ? 'bg-white cursor-pointer' : 'bg-gray-50 cursor-not-allowed'}`}
                  disabled={!formData.type}
                />
                <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>

              {dropdowns.categoryName && formData.type && (
                <>
                  <div className='fixed inset-0 z-40' onClick={() => handleDropdownToggle('categoryName')} />
                  <ul className='absolute top-full left-0 z-50 w-full border border-gray-200 rounded-lg shadow-lg mt-1 bg-white'>
                    {categories[formData.type].map(option => (
                      <li
                        key={option}
                        onClick={() => handleDropdownSelect('categoryName', option)}
                        className='px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm cursor-pointer text-gray-900'>
                        <Tag className='w-4 h-4 text-gray-400' />
                        {option}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className='relative'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Date *
              </label>
              <div className='relative'>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className='w-full text-sm rounded-lg bg-white border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 text-gray-900'
                />
              </div>
            </div>

            <div className='relative'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <div className='relative'>
                <FileText className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Add a note about this transaction...'
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  className='w-full text-sm rounded-lg bg-white border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 pl-8 text-gray-900' 
                />
              </div>
            </div>

            <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                {loading ? 'Creating...' : 'Create transaction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransaction