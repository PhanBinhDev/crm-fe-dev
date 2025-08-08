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
};
