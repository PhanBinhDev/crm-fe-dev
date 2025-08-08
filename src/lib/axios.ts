import axios from 'axios';
import { message } from 'antd';
import { ApiResponse, ApiResponseNoData } from '@/common/types/api';
import { API_URL } from '@/constants';

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

    if (data.statusCode >= 400) {
      message.error(data.message || 'Có lỗi xảy ra');
      return Promise.reject(new Error(data.message));
    }

    return response;
  },
  error => {
    console.log('Axios error:', error);

    if (error?.code === 'ERR_NETWORK') {
      message.error('Không thể kết nối tới server.');
      return Promise.reject(error);
    }

    const errorResponse = error.response?.data;

    if (errorResponse) {
      message.error(errorResponse.message || 'Có lỗi xảy ra');
    } else {
      message.error('Có lỗi xảy ra');
    }

    return Promise.reject(error);
  },
);
