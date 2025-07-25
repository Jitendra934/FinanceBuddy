
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/formatCurrency';

const Display = ({ text1, text2, text3, Icon, type = "default" }) => {
  
  const getTrendInfo = () => {
    if (!text3) return { icon: Minus, color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
    
    const isUp = text3.toLowerCase().includes('up');
    const isDown = text3.toLowerCase().includes('down');
    
    if (type === 'income') {
      if (isUp) return { 
        icon: TrendingUp, 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300'
      };
      if (isDown) return { 
        icon: TrendingDown, 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-300'
      };
    } else if (type === 'expense') {
      if (isUp) return { 
        icon: TrendingUp, 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-300'
      };
      if (isDown) return { 
        icon: TrendingDown, 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300'
      };
    } else {
      if (isUp) return { 
        icon: TrendingUp, 
        color: 'text-blue-600 dark:text-blue-400', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-300'
      };
      if (isDown) return { 
        icon: TrendingDown, 
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        textColor: 'text-orange-700 dark:text-orange-300'
      };
    }
    
    return { 
      icon: Minus, 
      color: 'text-gray-500 dark:text-gray-400', 
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-600 dark:text-gray-300'
    };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  return (
    <div className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-1 min-w-[280px]">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${trendInfo.bgColor} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`w-5 h-5 ${trendInfo.color}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">
            {text1}
          </h3>
        </div>
        {text3 && (
          <div className={`p-1.5 rounded-full ${trendInfo.bgColor}`}>
            <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
          </div>
        )}
      </div>

      
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
          {formatCurrency(text2)}
        </p>
      </div>

      
      {text3 && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${trendInfo.textColor}`}>
            {text3}
          </span>
        </div>
      )}

    </div>
  );
};

export default Display;