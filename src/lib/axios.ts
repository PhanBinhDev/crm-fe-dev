import axios from 'axios';
import { message } from 'antd';
import { ApiResponse, ApiResponseNoData } from '@/common/types/api';
import { API_URL } from '@/constants';
import { authService } from '@/services/api/auth';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  response => {
    const data = response.data as ApiResponse<unknown> | ApiResponseNoData;

    console.log('Axios response with data:', data);

    return response;
  },
  async error => {
    console.log('Axios error:', error);

    if (error?.code === 'ERR_NETWORK') {
      message.error('Không thể kết nối tới server.');
      return Promise.reject(error);
    }

    const errorResponse = error.response?.data;

    if (errorResponse) {
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

        // call api logout
        // await authService.logout();
      }
    }

    return Promise.reject(error);
  },
);
