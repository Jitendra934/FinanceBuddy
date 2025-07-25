import { create } from 'zustand';
import { transactionAPI, reportAPI } from '../service/api';
import toast from 'react-hot-toast';

const useTransactionStore = create((set, get) => ({

  transactionData: [],
  filteredTransactions: [],
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,

  
  filters: {
    fromDate: '',
    toDate: '',
    selectCategory: 'All',
    minAmount: 0,
    maxAmount: 10000000,
    searchQuery: '',
  },

  
  optionOpen: false,
  categoryDropdown: false,
  updateTransactionModal: false,

  
  amount: {
    income: 0,
    expense: 0,
    balance: 0,
    currentMonthName: '',
  },

  // Current transaction for update
  currentTransactionData: null,
  updatedTransaction: {
    note: '',
    amount: 0,
    categoryName: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setOptionOpen: (open) => set({ optionOpen: open }),
  setCategoryDropdown: (open) => set({ categoryDropdown: open }),
  setUpdateTransactionModal: (open) => set({ updateTransactionModal: open }),

  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set((state) => ({
      filters: {
        fromDate: '',
        toDate: '',
        selectCategory: 'All',
        minAmount: '',
        maxAmount: '',
        searchQuery: '',
      },
      filteredTransactions: state.transactionData,
    })),

  // state for updating the transaction
  setCurrentTransactionData: (transaction) => {
    set({
      currentTransactionData: transaction,
      updatedTransaction: {
        note: transaction?.note || '',
        amount: transaction?.amount || 0,
        categoryName: transaction?.category?.name || '',
        type: transaction?.type || '',
        date: transaction?.date 
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      },
    });
  },

  setUpdatedTransaction: (updates) =>
    set((state) => ({
      updatedTransaction: { ...state.updatedTransaction, ...updates },
    })),

  
  filterTransactions: () => {
    const { transactionData, filters } = get();
    const { fromDate, toDate, selectCategory, minAmount, maxAmount, searchQuery } = filters;

    const filteredData = transactionData.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const startDate = fromDate ? new Date(fromDate) : null;
      const endDate = toDate ? new Date(toDate) : null;

      const dateMatch = (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate);

      const categoryMatch = !selectCategory || selectCategory === 'All' || selectCategory === '' ||
        transaction.category.name.toLowerCase().includes(selectCategory.toLowerCase());

      const minAmountValue = minAmount ? parseFloat(minAmount) : 0;
      const maxAmountValue = maxAmount ? parseFloat(maxAmount) : Infinity;
      const transactionAmount = parseFloat(transaction.amount);

      const amountMatch = (transactionAmount >= minAmountValue) && (transactionAmount <= maxAmountValue);

      const searchMatch = !searchQuery || 
        transaction.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.name.toLowerCase().includes(searchQuery.toLowerCase());

      return dateMatch && categoryMatch && amountMatch && searchMatch;
    });

    set({ filteredTransactions: filteredData });
  },

  
  fetchTransactions: (async (page = 1, itemsPerPage = 10) => {
    const { setLoading, setError, filterTransactions } = get();
    
    try {
      setLoading(true);
      setError(null);

      const { data, totalPages } = await transactionAPI.getTransactions(page, itemsPerPage);
      
      set({
        transactionData: data,
        filteredTransactions: data,
        totalPages,
        currentPage: page,
      });
      
      
      filterTransactions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get transactions');
      toast.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }),

  fetchDisplayData: async () => {
    const { setLoading } = get();
    
    try {
      setLoading(true);

      const result = await reportAPI.getMonthlyReports();

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthName = new Date(currentYear, parseInt(currentMonth)).toLocaleString('default', {
        month: 'long',
      });
      const currentMonthData = result[currentMonth];

      if (currentMonthData) {
        const balance = currentMonthData.income - currentMonthData.expense;
        set({
          amount: {
            income: currentMonthData.income,
            expense: currentMonthData.expense,
            balance: balance,
            currentMonthName: currentMonthName,
          },
        });
      } else {
        console.error('No data found for current month');
        set({
          amount: {
            income: 0,
            expense: 0,
            balance: 0,
            currentMonthName: currentMonthName,
          }
        })
      }
    } catch (error) {
      toast.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  },

  deleteTransaction: async (id) => {
    const { fetchDisplayData } = get();

    try {
      await transactionAPI.deleteTransaction(id);

      set((state) => ({
        filteredTransactions: state.filteredTransactions.filter(transaction => transaction.id !== id),
        transactionData: state.transactionData.filter(transaction => transaction.id !== id),
      }));
      
      await fetchDisplayData();
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  },

  updateTransaction: async (id) => {
    const { updatedTransaction, fetchDisplayData } = get();
    
    try {
      const updatedTransactionData = await transactionAPI.updateTransaction(id, updatedTransaction);

      set((state) => ({
        filteredTransactions: state.filteredTransactions.map(transaction => (
          transaction.id === id ? updatedTransactionData : transaction
        )),
        transactionData: state.transactionData.map(transaction => (
          transaction.id === id ? updatedTransactionData : transaction
        )),
        updateTransactionModal: false,
        currentTransactionData: null,
        updatedTransaction: {
          note: '',
          amount: 0,
          categoryName: '',
          type: '',
          date: new Date().toISOString().split('T')[0],
        },
      }));
      await fetchDisplayData();
      toast.success('Transaction updated successfully');
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  },

  
  handlePageChange: (page) => {
    const { totalPages, fetchTransactions } = get();
    
    if (page > 0 && page <= totalPages) {
      fetchTransactions(page);
    }
  },

  
  handleOptionSelect: (value) => {
    set((state) => ({
      filters: { ...state.filters, selectCategory: value },
      optionOpen: false,
    }));
    
    // Apply filters after selection
    setTimeout(() => get().filterTransactions(), 0);
  },

  
  openUpdateModal: (id) => {
    const { filteredTransactions } = get();
    const transaction = filteredTransactions.find(transaction => transaction.id === id);
    
    if (transaction) {
      get().setCurrentTransactionData(transaction);
      set({ updateTransactionModal: true });
    } else {
      toast.error('Transaction not found for update');
    }
  },

  closeUpdateModal: () => {
    set({
      updateTransactionModal: false,
      currentTransactionData: null,
      updatedTransaction: {
        note: '',
        amount: 0,
        categoryName: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
      },
    });
  },
}));

export default useTransactionStore;