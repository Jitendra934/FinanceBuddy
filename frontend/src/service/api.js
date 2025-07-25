import axios from "axios";
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error(error.response?.data?.message || 'An error occurred');
    return Promise.reject(error);
  }
);

export const userAPI = {
  login: async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/signin', { email, password });
      return data;
    } catch (error) {
      throw error
    }
  },

  signUp: async (name, email, password) => {
    try {
      const { data } = await apiClient.post('/auth/signup', { name, email, password });
      return data;
    } catch (error) {
      throw error
    }
  },

  getUserData: async () => {
    try {
      const { data } = await apiClient.get('/auth/check-auth');
      return data;
    } catch (error) {
      throw error
    }
  },

  verifyEmail: async (verificationCode) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { verificationCode })
      return response;
    } catch (error) {
      throw error
    }
  },

  sendResetPasswordVerificationEmail: async (email) => {
    try {
      const response = await apiClient.post('/auth/send-reset-password-code', { email });
      return response;
    } catch (error) {
      throw error
    }
  },

  ResetPassword: async (email, verificationCode, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, verificationCode, newPassword })
      return response;
    } catch (error) {
      throw error
    }
  }
}


export const transactionAPI = {
  getTransactions: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getMonthlyTransactions: async (month, year) => {
    try {
      const response = await apiClient.get(`/transactions/monthly?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const response = await apiClient.put(`/transactions/${id}`, {
        note: transactionData.note,
        amount: transactionData.amount,
        categoryName: transactionData.categoryName,
        type: transactionData.type,
        date: transactionData.date
      });
      return response.data;
    } catch (error) {
      throw error
    }
  },

  deleteTransaction: async (id) => {
    try {
      const response = await apiClient.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error
    }
  }
}

export const reportAPI = {
  getMonthlyReports: async () => {
    try {
      const response = await apiClient.get('/reports/monthly');
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getCategoryReports: async (period = 'current') => {
    try {
      const response = await apiClient.get(`/reports/category?period=${period}`);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  getBalanceReports: async () => {
    try {
      const response = await apiClient.get('/reports/balance');
      return response.data;
    } catch (error) {
      throw error
    }
  }
}

export const budgetAPI = {
  getBudgets: async (month, year) => {
    try {
      const response = await apiClient.get(`/budgets?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  createBudget: async (budgetData) => {
    try {
      const response = await apiClient.post('/budgets', {
        amount: parseFloat(budgetData.amount),
        month: parseInt(budgetData.month),
        year: parseInt(budgetData.year),
        categoryName: budgetData.categoryName
      });
      return response.data;
    } catch (error) {
      throw error
    }
  },

  updateBudget: async (id, budgetData) => {
    try {
      const response = await apiClient.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error
    }
  },

  deleteBudget: async (id) => {
    try {
      await apiClient.delete(`/budgets/${id}`);
    } catch (error) {
      throw error
    }
  }
}

export default apiClient;

