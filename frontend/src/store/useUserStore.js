import { create } from "zustand";
import { userAPI } from "../service/api";
import toast from "react-hot-toast";


const useUserStore = create((set, get) => ({

  isLoggedIn: false,
  userData: null,
  isAuthenticated: false,
  isLoading: false,

  setIsLoggedIn: (val) => set({ isLoggedIn: val }),
  setUserData: (val) => set({ userData: val }),


  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, userData: null, isLoading: false });
      return;
    }

    try {
      const data = await userAPI.getUserData();
      if (data.success) {
        set({ isAuthenticated: true, userData: data.userData, isLoading: false });
      } else {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, userData: null, isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('token');
      set({ isAuthenticated: false, userData: null, isLoading: false });
      console.error("Authentication check failed:", error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await userAPI.login(email, password);
      localStorage.setItem('token', response.token);
      await get().checkAuth(); 
      toast.success(response.message || 'Logged in successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
      set({ isLoading: false, isAuthenticated: false, userData: null });
      return false;
    }
  },

  logout: () => {
    set({ isLoading: true });
    localStorage.removeItem('token');
    set({ isAuthenticated: false, userData: null, isLoading: false });
    toast.success('Logged out successfully');
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
        const signupResponse = await userAPI.signUp(name, email, password);
        toast.success(signupResponse.message || 'Signup successful!');
        
        await get().login(email, password);
        
        return true;
    } catch (error) {
        set({ isLoading: false });
        return false;
    }
  }
}))

export default useUserStore