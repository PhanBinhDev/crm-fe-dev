import { axiosInstance } from '@/lib/axios';
import { ApiPaginatedResponse, ApiResponse } from '@/common/types/api';
import { CreateUserDto, UpdateUserDto } from '@/common/interfaces/users';
import { IUser } from '@/common/types';

export const UserService = {
  getUsers: async (params: any) => {
    const response = await axiosInstance.get<ApiPaginatedResponse<IUser>>('/users/all', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<IUser>>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserDto) => {
    const response = await axiosInstance.post<ApiResponse<IUser>>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
    const response = await axiosInstance.patch<ApiResponse<IUser>>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },

  importUsers: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  },

  importUsersFromUrl: async (url: string) => {
    try {
      // Gọi endpoint riêng cho URL import
      const response = await axiosInstance.post<ApiResponse<any>>('/users/import-url', { url });
      return response.data;
    } catch (error) {
      console.error('Error importing users from URL:', error);
      throw error;
    }
  },
};
