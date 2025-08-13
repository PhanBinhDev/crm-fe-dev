import { axiosInstance } from '@/lib/axios';
import { ApiPaginatedResponse, ApiResponse } from '@/common/types/api';
import { CreateUserDto, UpdateUserDto } from '@/common/interfaces/users';
import { IUser } from '@/common/types';

export const UserService = {
  getUsers: async (params: any) => {
    try {
      const response = await axiosInstance.get<ApiPaginatedResponse<IUser>>('/users/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await axiosInstance.get<ApiResponse<IUser>>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (data: CreateUserDto) => {
    try {
      console.log('UserService.createUser - Sending data:', data);
      console.log('UserService.createUser - API endpoint:', '/users');
      
      const response = await axiosInstance.post<ApiResponse<IUser>>('/users', data);
      console.log('UserService.createUser - Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.createUser - Error:', error);
      console.error('UserService.createUser - Error response:', error?.response?.data);
      throw error;
    }
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
    try {
      console.log('UserService.updateUser - Sending data:', data);
      console.log('UserService.updateUser - API endpoint:', `/users/${id}`);
      
      const response = await axiosInstance.patch<ApiResponse<IUser>>(`/users/${id}`, data);
      console.log('UserService.updateUser - Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.updateUser - Error:', error);
      console.error('UserService.updateUser - Error response:', error?.response?.data);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    try {
      const response = await axiosInstance.patch<ApiResponse<IUser>>(`/users/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },
};
