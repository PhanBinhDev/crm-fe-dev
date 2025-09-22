import { axiosInstance } from '@/lib/axios';

export interface CreateWorkspacePayload {
  name: string;
  description: string;
  icon: string;
  visibility: string;
  avatar: string;
}

export async function createWorkspace(payload: CreateWorkspacePayload) {
  const res = await axiosInstance.post('/workspaces', payload);
  return res.data;
}
