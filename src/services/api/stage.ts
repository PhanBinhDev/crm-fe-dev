import { IStage } from '@/common/types/stage';
import { axiosInstance } from '@/lib/axios';

export const stageApi = {
  getAll: async (): Promise<IStage[]> => {
    const response = await axiosInstance.get('/stages');
    return response.data.data;
  },

  updatePosition: async (id: string, position: number): Promise<IStage> => {
    const response = await axiosInstance.patch(`/stages/${id}`, { position });
    return response.data.data;
  },

  update: async (id: string, data: Partial<IStage>): Promise<IStage> => {
    const response = await axiosInstance.patch(`/stages/${id}`, data);
    return response.data.data;
  },

  create: async (data: Omit<IStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<IStage> => {
    const response = await axiosInstance.post('/stages', data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/stages/${id}`);
  },
};
