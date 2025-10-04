import { AuthProvider } from '@refinedev/core';
import { axiosInstance } from '@/lib/axios';

export const authProvider: AuthProvider = {
  login: async () => {
    return {
      success: true,
      redirectTo: '/',
    };
  },

  logout: async () => {
    try {
      await axiosInstance.delete('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    console.log('Auth check');

    try {
      await axiosInstance.get('/auth/me');
      return {
        authenticated: true,
        redirectTo: '/',
      };
    } catch (error: any) {
      return {
        authenticated: false,
        redirectTo: '/login',
      };
    }
  },

  getPermissions: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.data.role || null;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.data;
    } catch {
      return null;
    }
  },

  onError: async error => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
