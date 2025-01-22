import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { create } from 'zustand';
import { ApiRoutes } from '@/config/api-routes';
import { request } from '@/config/api-config';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AuthState {
  isLoggedIn: boolean;
  token: null | string;
  isLoading: boolean;
  isSuccess: boolean;
  isAccountDeleting?: boolean;
  isAccountDeleted?: boolean;
  
  login: (username: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  verify: (email: string, otp: string) => Promise<boolean>;
  setPassword: (email: string, password: string) => Promise<boolean>;
  passwordResetRequest: (email: string) => Promise<boolean>;
  passwordReset: (key: string, password: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
}

const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: false,
  token: null,
  isLoading: false,
  isSuccess: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true, isSuccess: false });
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await axios.post(`${apiUrl}/${ApiRoutes.login}`, formData);
      const token = response.data['access_token'];
      set({ isLoggedIn: true, token, isLoading: false, isSuccess: true });

      sessionStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7 });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to login.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  signup: async (name: string, email: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await axios.post(`${apiUrl}/${ApiRoutes.signup}`, {
        name,
        email,
      });
      set({ isLoading: false, isSuccess: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Signup failed. Please try again.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  verify: async (email: string, otp: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await axios.post(`${apiUrl}/${ApiRoutes.verify}`, {
        email,
        otp,
      });
      set({ isLoading: false, isSuccess: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to verify, please try again.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  setPassword: async (email: string, password: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await axios.post(`${apiUrl}/${ApiRoutes.setPassword}`, {
        email,
        password,
      });
      set({ isLoading: false, isSuccess: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || 'Failed to set password, please try again.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  passwordResetRequest: async (email: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await axios.post(
        `${apiUrl}/${ApiRoutes.passwordResetRequest}/?email=${encodeURIComponent(email)}`,
      );
      set({ isLoading: false, isSuccess: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to request password reset.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  passwordReset: async (key: string, password: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await axios.post(
        `${apiUrl}/${ApiRoutes.passwordReset}/?token=${key}&new_password=${encodeURIComponent(
          password,
        )}`,
      );
      set({ isLoading: false, isSuccess: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to reset password.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  deleteAccount: async (password: string) => {
    set({ isAccountDeleting: true, isAccountDeleted: false });
    try {
      const response = await request('delete', `/auth/account?password=${password}`);
      set({ isAccountDeleting: false, isAccountDeleted: true });
      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete account.';
      set({ isAccountDeleting: false, isAccountDeleted: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));

export default useAuthStore;