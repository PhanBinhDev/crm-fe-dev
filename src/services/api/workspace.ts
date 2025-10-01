import { axiosInstance } from '@/lib/axios';

export interface CreateWorkspacePayload {
  name: string;
  description: string;
  visibility: string;
  avatar: string;
  members?: string[];
}

export async function createWorkspace(payload: CreateWorkspacePayload) {
  const res = await axiosInstance.post('/workspaces', payload);
  return res.data;
}
