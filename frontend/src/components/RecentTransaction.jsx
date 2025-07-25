import { ArrowUpRight } from 'lucide-react'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dateFormat } from '../lib/dateFormat';
import { formatCurrency } from '../lib/formatCurrency';

const RecentTransaction = memo(({ transactions }) => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col w-full mb-4'>
      <div className='hidden xl:block overflow-x-auto '>
        <table className='w-full mt-4 mb-4'>
          <thead>
            <tr className=' border-b-2 border-b-gray-200'>
              <th className='text-sm font-semibold text-gray-800 text-left py-3.5'>Date</th>
              <th className='text-sm font-semibold text-gray-800 text-left py-3.5'>Description</th>
              <th className='text-sm font-semibold text-gray-800 text-left py-3.5'>Category</th>
              <th className='text-sm font-semibold text-gray-800 text-left py-3.5'>Type</th>
              <th className='text-sm font-semibold text-gray-800 text-left py-3.5'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className='border-b border-gray-100 hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:-translate-y-0.5'>
                <td className='py-3 text-sm text-neutral-800'>{dateFormat(transaction.date)}</td>
                <td className='py-3 text-sm text-neutral-800'>{transaction.note}</td>
                <td className='py-3 text-sm text-stone-400'>{transaction.category.name}</td>
                <td className={`py-3 text-sm font-medium ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>{transaction.type}</td>
                <td className={`py-3 text-sm ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {(transaction.type === 'INCOME' ? '+' : '-') + formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='xl:hidden space-y-4 mt-4 mb-4'>
        {transactions.map(transaction => (
          <div key={transaction.id} className='border border-gray-300 p-4 rounded-lg bg-gray-50'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <p className='font-medium text-neutral-800'>{transaction.note}</p>
                <p className='text-sm text-stone-400'>{dateFormat(transaction.date)}</p>
              </div>
              <p className={`text-sm ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                {(transaction.type === 'INCOME' ? '+' : '-') + formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-stone-400'>{transaction.category.name} • {transaction.type}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-end'>
        <button
          onClick={() => navigate('/transactions')}
          className='px-4 py-2.5 flex items-center justify-center bg-transparent rounded-md gap-1 hover:bg-gray-100 transition-all hover:-translate-1'>
          <h3 className='text-sm font-medium text-indigo-500'>View All Transactions</h3>
          <ArrowUpRight className='w-4 h-4 text-indigo-500' />
        </button>
      </div>
    </div>
  )
})

export default RecentTransaction;