import { IUser, LoginRequest, LoginResponse } from '@/common/types';
import { ApiResponse, ApiResponseNoData } from '@/common/types/api';
import { axiosInstance } from '@/lib/axios';

export const authService = {
  login: (data: LoginRequest) => axiosInstance.post<LoginResponse>('/auth/login', data),

  logout: () => axiosInstance.delete<ApiResponseNoData>('/auth/logout'),

  getProfile: () => axiosInstance.get<ApiResponse<IUser>>('/auth/me'),
};
