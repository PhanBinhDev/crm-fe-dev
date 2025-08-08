import { authService } from '@/services/api/auth';
import { AuthProvider } from '@refinedev/core';

export const authProvider: AuthProvider = {
  login: async () => {
    return {
      success: true,
      redirectTo: '/',
    };
  },

  logout: async () => {
    try {
      // Call logout API to clear cookies on backend
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    try {
      await authService.getProfile();
      return {
        authenticated: true,
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
      const response = await authService.getProfile();
      return response.data.data.role || null;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const response = await authService.getProfile();

      console.log('User identity:', response.data);

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
