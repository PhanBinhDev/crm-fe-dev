import { axiosInstance } from '@/lib/axios';
import { ApiPaginatedResponse, ApiResponse } from '@/common/types/api';
import { IActivity, FormAddActivityPayload } from '@/common/types/activities';

export const ActivityService = {
  // POST /api/activities - Tạo mới activity
  createActivity: async (data: FormAddActivityPayload) => {
    const response = await axiosInstance.post<ApiResponse<IActivity>>('/activities', data);
    return response.data;
  },

  // GET /api/activities - Lấy danh sách activities
  getActivities: async (params: any) => {
    const response = await axiosInstance.get<ApiPaginatedResponse<IActivity>>('/activities', { params });
    return response.data;
  },

  // GET /api/activities/filter - Lấy danh sách công việc theo loại
  getActivitiesByFilter: async (filterType: string) => {
    const response = await axiosInstance.get<ApiResponse<IActivity[]>>(`/activities/filter?type=${filterType}`);
    return response.data;
  },

  // GET /api/activities/{id}/sub-activities - Lấy danh sách sub-activities
  getSubActivities: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<IActivity[]>>(`/activities/${id}/sub-activities`);
    return response.data;
  },

  // PATCH /api/activities/{id}/status - Cập nhật trạng thái công việc
  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}/status`, { status });
    return response.data;
  },

  // GET /api/activities/{id} - Lấy thông tin activity theo ID
  getActivity: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<IActivity>>(`/activities/${id}`);
    return response.data;
  },

  // DELETE /api/activities/{id} - Xóa activity theo ID
  deleteActivity: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/activities/${id}`);
    return response.data;
  },

  // PATCH /api/activities/{id} - Cập nhật activity theo ID
  updateActivity: async (id: string, data: Partial<FormAddActivityPayload>) => {
    const response = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}`, data);
    return response.data;
  },

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
    const response = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}/participants`, { participants });
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
    const response = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}/assignees`, { assignees });
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
    const response = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}/semester/${semesterId}`);
    return response.data;
  },

  // DELETE /api/activities/{id}/semester/{semesterId} - Xóa liên kết activity với kỳ học
  removeFromSemester: async (id: string, semesterId: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/activities/${id}/semester/${semesterId}`);
    return response.data;
  },

  // Helper methods for common operations
  markComplete: async (id: string) => {
    return ActivityService.updateStatus(id, 'completed');
  },

  duplicateActivity: async (id: string) => {
    // Lấy activity hiện tại
    const activity = await ActivityService.getActivity(id);
    // Tạo activity mới với tên có suffix " (Copy)"
    const duplicateData = {
      ...activity.data,
      name: `${activity.data.name} (Copy)`,
    };
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    return ActivityService.createActivity(duplicateData);
  },
};
