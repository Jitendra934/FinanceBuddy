import { formatCurrency } from '../lib/formatCurrency';

const BudgetProgress = ({ budgetComparison }) => {
  return (
    <div className="space-y-4">
      {Object.entries(budgetComparison).map(([category, data]) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{category}</span>
            <span className="text-sm text-gray-500">{Math.min(data.percentage.toFixed(0), 100)}%</span>
            {data.percentage >= 100 && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Budget exceeded
              </span>
            )}
            {data.percentage >= 90 &&  data.percentage <= 100 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Over Budget
              </span>
            )}
            {data.percentage >= 70 && data.percentage < 90 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Warning
              </span>
            )}
            {data.percentage < 70 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                On Track
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">

            <div
              className={`h-2 rounded-full transition-all duration-300 ${data.percentage >= 100 ? 'bg-red-500' :
                data.percentage >= 100 ? 'bg-red-500' :
                data.percentage >= 90 ? 'bg-orange-500' :
                data.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(data.percentage, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{formatCurrency(data.actual)} of {formatCurrency(data.budgeted)} spent</span>
            <span className={`font-medium ${data.remaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {data.remaining >= 0 ? '+' : ''}{formatCurrency(data.remaining)} remaining
            </span>
          </div>
          {data.percentage > 100 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              ⚠️ You've exceeded your budget by {formatCurrency(Math.abs(data.remaining))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BudgetProgress;
