import { IUser, LoginRequest, LoginResponse } from '@/common/types';
import { ApiResponse } from '@/common/types/api';
import { axiosInstance } from '@/lib/axios';

export const authService = {
  login: (data: LoginRequest) => axiosInstance.post<LoginResponse>('/auth/login', data),

  register: (data: any) => axiosInstance.post<LoginResponse>('/auth/register', data),

  logout: () => axiosInstance.post('/auth/logout'),

  // Check authentication status - BE will check cookies
  getProfile: () => axiosInstance.get<ApiResponse<IUser>>('/auth/me'),

  refreshToken: () => axiosInstance.post<LoginResponse>('/auth/refresh'),

  forgotPassword: (email: string) => axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    axiosInstance.post('/auth/reset-password', data),
};
