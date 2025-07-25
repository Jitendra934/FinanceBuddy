import { create } from 'zustand';
import { budgetAPI, transactionAPI } from '../service/api';
import { formatCurrency } from '../lib/formatCurrency';
import toast from 'react-hot-toast';

const categories = ['Food', 'Transportation', 'Entertainment', 'Grocery', 'Shopping', 'HealthCare', 'Bills', 'Education', 'Other Expenses'];

const useBudgetStore = create((set, get) => ({
  budgets: [],
  transactions: [],
  balanceReport: { income: 0, expense: 0, balance: 0 },
  showNewBudgetModal: false,
  newBudget: {
    categoryName: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  },
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  updateBudgetModal: false,
  currentBudgetUpdate: null,
  updatedBudget: {
    month: 0,
    year: 2025,
    categoryName: '',
    amount: 0,
  },
  categoryDropdown: false,
  categories,
  loading: false,
  error: null,

  setShowNewBudgetModal: (val) => set({ showNewBudgetModal: val }),
  setCategoryDropdown: (val) => set({ categoryDropdown: val }),
  setCurrentMonth: (val) => set({ currentMonth: val }),
  setCurrentYear: (val) => set({ currentYear: val }),
  setNewBudget: (budget) => set({ newBudget: budget }),
  setBudgets: (budgets) => set({ budgets }),
  setTransactions: (transactions) => set({ transactions }),
  setBalanceReport: (report) => set({ balanceReport: report }),
  setUpdateBudgetModal: (val) => set({ updateBudgetModal: val }),
  setCurrentBudgetUpdate: (budget) => set({ currentBudgetUpdate: budget }),
  setUpdatedBudget: (budget) => set({ updatedBudget: budget }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchBudgetData: async () => {
    const { setLoading, setError } = get();

    try {
      setLoading(true)
      setError(null)

      const { currentMonth, currentYear } = get();
      const budgetsData = await budgetAPI.getBudgets();
      set({ budgets: budgetsData });
      const transactionsData = await transactionAPI.getTransactions();
      set({ transactions: transactionsData.data });
      const monthlyTotals = get().calculateMonthlyTotals(budgetsData, transactionsData.data, currentMonth, currentYear);
      set({ balanceReport: monthlyTotals });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get budgets');
      toast.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  },

  calculateMonthlyTotals: (budgets, transactions, month, year) => {
    const monthBudgets = budgets.filter(budget => budget.month === month && budget.year === year);
    const totalBudgeted = monthBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'EXPENSE' && txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
    });
    const totalSpent = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const remaining = totalBudgeted - totalSpent;
    return {
      income: totalBudgeted,
      expense: totalSpent,
      balance: remaining
    };
  },


  getBudgetComparison: () => {
    const { budgets, transactions, currentMonth, currentYear } = get();
    const comparison = {};

    const currentMonthBudgets = budgets.filter(budget =>
      budget.month === currentMonth && budget.year === currentYear
    );

    currentMonthBudgets.forEach(budget => {
      const categorySpending = transactions
        .filter(tx =>
          tx.type === 'EXPENSE' &&
          ((tx.category && tx.category.name === budget.category.name) ||
            (tx.categoryName && tx.categoryName === budget.category.name)) &&
          new Date(tx.date).getMonth() + 1 === currentMonth &&
          new Date(tx.date).getFullYear() === currentYear
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      comparison[budget.category.name] = {
        budgeted: budget.amount,
        actual: categorySpending,
        remaining: budget.amount - categorySpending,
        percentage: budget.amount > 0 ? (categorySpending / budget.amount) * 100 : 0
      };
    });

    return comparison;
  },

  getMonthlyTrendData: () => {
  const { budgets, transactions } = get();
  
  // Filter and log expense transactions
  const expenseTransactions = transactions.filter(tx => tx.type === 'EXPENSE')
  
  const allPeriods = new Set();
  
  // Add periods from budgets
  budgets.forEach(b => {
    if (b.month && b.year) {
      const period = `${b.year}-${String(b.month).padStart(2, '0')}`;
      allPeriods.add(period);
    }
  });
  
  // Add periods from expense transactions
  expenseTransactions.forEach(tx => {
    if (tx.date) {
      const txDate = new Date(tx.date);
      const year = txDate.getUTCFullYear();
      const month = txDate.getUTCMonth() + 1;
      const period = `${year}-${String(month).padStart(2, '0')}`;
      allPeriods.add(period);
    }
  });
  
  const sortedPeriods = Array.from(allPeriods).sort((a, b) => a.localeCompare(b));
  
  const trendData = sortedPeriods.map(period => {
    const [year, month] = period.split('-').map(Number);
    
    // Get budgets for this month/year
    const monthBudgets = budgets.filter(b => 
      b.month === month && b.year === year
    );
    const totalBudgeted = monthBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    // Get expenses for this month/year
    const monthExpenses = expenseTransactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      const txYear = txDate.getUTCFullYear();
      const txMonth = txDate.getUTCMonth() + 1;
      
      const matches = txMonth === month && txYear === year;
      return matches;
    });
    
    const totalSpent = monthExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    // Create date object for formatting
    const date = new Date(year, month - 1, 1);
    
    const result = {
      month: date.toLocaleDateString('default', {
        month: 'short',
        year: '2-digit'
      }),
      budgeted: totalBudgeted,
      actual: totalSpent,
      fullDate: period
    };
    
    return result;
  });
  
  return trendData;
},


  handleCreateBudget: async () => {
    const { newBudget, fetchBudgetData, setNewBudget, setShowNewBudgetModal, setLoading, setError } = get();
    if (newBudget.categoryName && newBudget.amount) {
      try {
        setLoading(true)
        setError(null)

        await budgetAPI.createBudget(newBudget);
        await fetchBudgetData();
        setNewBudget({ categoryName: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
        setShowNewBudgetModal(false);
        toast.success('Budget created successfully');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to create budget');
        toast.error('Error creating budget:', error?.response?.data || error);
      } finally {
        setLoading(false)
      }
    }
  },

  handleDeleteBudget: async (id) => {
    const { budgets, setBudgets } = get();
    try {
      await budgetAPI.deleteBudget(id);
      setBudgets(budgets.filter(budget => budget.id !== id));
      toast.success('Budget deleted successfully');
    } catch (error) {
      toast.error('Error deleting budget:', error);
    }
  },

  handleBudgetUpdate: (id) => {
    const { budgets, setCurrentBudgetUpdate, setUpdatedBudget, setUpdateBudgetModal } = get();
    const budget = budgets.find(budget => budget.id === id);
    if (budget) {
      setCurrentBudgetUpdate(budget);
      setUpdatedBudget({
        amount: budget.amount || '',
        month: budget.month || '',
        year: budget.year || '',
        categoryName: budget.categoryName || budget.category.name || ''
      });
      setUpdateBudgetModal(true);
    } else {
      toast.error('Budget not found for update');
    }
  },

  handleUpdateSubmit: async (e, id) => {
    e.preventDefault();
    const { updatedBudget, budgets, setBudgets, setUpdateBudgetModal, setCurrentBudgetUpdate, setUpdatedBudget, setLoading, setError } = get();
    try {
      setLoading(true)
      setError(null)

      const updatedBudgetData = await budgetAPI.updateBudget(id, updatedBudget);
      setBudgets(budgets.map(budget => (
        budget.id === id ? updatedBudgetData : budget
      )));
      setUpdateBudgetModal(false);
      setCurrentBudgetUpdate(null);
      setUpdatedBudget({
        amount: '',
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        categoryName: ''
      });
      toast.success('Budget updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update budget');
      toast.error('Failed to update the budget', error.response?.data.message || error);
    } finally {
      setLoading(false)
    }
  },

  getStatusColor: (percentage) => {
    if (percentage >= 100) return 'text-red-500';
    if (percentage >= 90) return 'text-orange-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  },

  getStatusIcon: (percentage) => {
    if (percentage >= 100) return 'warning'
    if (percentage >= 90) return 'alert';
    if (percentage >= 70) return 'trending';
    return 'target';
  },

}));


export default useBudgetStore;
