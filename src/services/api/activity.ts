import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/common/types/api';

export const ActivityService = {
  // POST /api/activities/{id}/files - Đính kèm file cho activity
  uploadFiles: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await axiosInstance.post<ApiResponse<any>>(`/activities/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /api/activities/{id}/files - Lấy danh sách file đính kèm
  getFiles: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/activities/${id}/files`);
    return response.data;
  },

  // PATCH /api/activities/{id}/participants - Cập nhật participant
  updateParticipants: async (id: string, participants: string[]) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/activities/${id}/participants`, { participants });
    return response.data;
  },

  // GET /api/activities/{id}/feedback - Lấy danh sách feedback
  getFeedback: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/activities/${id}/feedback`);
    return response.data;
  },

  // POST /api/activities/{id}/feedback - Gửi phản hồi/feedback
  addFeedback: async (id: string, feedback: { content: string; rating?: number }) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/activities/${id}/feedback`, feedback);
    return response.data;
  },

  // PATCH /api/activities/{id}/assignees - Gán người thực hiện
  updateAssignees: async (id: string, assignees: string[]) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/activities/${id}/assignees`, { assignees });
    return response.data;
  },

  // GET /api/activities/{id}/assignees - Lấy danh sách người thực hiện
  getAssignees: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/activities/${id}/assignees`);
    return response.data;
  },

  // DELETE /api/activities/{id}/assignees/{userId} - Xóa người thực hiện
  removeAssignee: async (id: string, userId: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/activities/${id}/assignees/${userId}`);
    return response.data;
  },

  // PATCH /api/activities/{id}/assignees/{userId} - Cập nhật thông tin người thực hiện
  updateAssignee: async (id: string, userId: string, data: any) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/activities/${id}/assignees/${userId}`, data);
    return response.data;
  },

  // PATCH /api/activities/{id}/semester/{semesterId} - Gán activity vào kỳ học
  assignToSemester: async (id: string, semesterId: string) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/activities/${id}/semester/${semesterId}`);
    return response.data;
  },

  // DELETE /api/activities/{id}/semester/{semesterId} - Xóa liên kết activity với kỳ học
  removeFromSemester: async (id: string, semesterId: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/activities/${id}/semester/${semesterId}`);
    return response.data;
  },

  // GET /api/activities/{id}/sub-activities - Lấy danh sách sub-activities
  getSubActivities: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/activities/${id}/sub-activities`);
    return response.data;
  },

  // GET /api/activities/filter - Lấy danh sách công việc theo loại
  getActivitiesByFilter: async (filterType: string) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/activities/filter?type=${filterType}`);
    return response.data;
  },
};
