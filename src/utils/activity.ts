import {
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
  AssigneeRole,
  AssignmentStatus,
} from '@/common/enum/activity';
import { IActivity } from '@/common/types';
import { useEffect, useState } from 'react';

// Assignee utilities
export const getAssigneeRoleLabel = (role: AssigneeRole): string => {
  switch (role) {
    case AssigneeRole.OWNER:
      return 'Chủ trì';
    case AssigneeRole.COLLABORATOR:
      return 'Thành viên';
    case AssigneeRole.REVIEWER:
      return 'Phản biện';
    default:
      return role;
  }
};

export const getAssigneeRoleColor = (role: AssigneeRole): string => {
  switch (role) {
    case AssigneeRole.OWNER:
      return 'red';
    case AssigneeRole.COLLABORATOR:
      return 'blue';
    case AssigneeRole.REVIEWER:
      return 'purple';
    default:
      return 'default';
  }
};

export const getAssignmentStatusLabel = (status: AssignmentStatus): string => {
  switch (status) {
    case AssignmentStatus.ACCEPTED:
      return 'Đã chấp nhận';
    case AssignmentStatus.DECLINED:
      return 'Từ chối';
    case AssignmentStatus.PENDING:
      return 'Chờ xác nhận';
    default:
      return status;
  }
};

export const getAssignmentStatusColor = (status: AssignmentStatus): string => {
  switch (status) {
    case AssignmentStatus.ACCEPTED:
      return 'green';
    case AssignmentStatus.DECLINED:
      return 'red';
    case AssignmentStatus.PENDING:
      return 'orange';
    default:
      return 'default';
  }
};

// Activity utilities
export const getActivityStatusLabel = (status: ActivityStatus): string => {
  switch (status) {
    case ActivityStatus.NEW:
      return 'Mới';
    case ActivityStatus.IN_PROGRESS:
      return 'Đang thực hiện';
    case ActivityStatus.COMPLETED:
      return 'Hoàn thành';
    case ActivityStatus.OVERDUE:
      return 'Quá hạn';
    default:
      return status;
  }
};

export const getActivityStatusColor = (status: ActivityStatus): string => {
  switch (status) {
    case ActivityStatus.NEW:
      return 'blue';
    case ActivityStatus.IN_PROGRESS:
      return 'orange';
    case ActivityStatus.COMPLETED:
      return 'green';
    case ActivityStatus.OVERDUE:
      return 'red';
    default:
      return 'default';
  }
};

export const getActivityPriorityLabel = (priority: ActivityPriority): string => {
  switch (priority) {
    case ActivityPriority.LOW:
      return 'Thấp';
    case ActivityPriority.MEDIUM:
      return 'Trung bình';
    case ActivityPriority.HIGH:
      return 'Cao';
    case ActivityPriority.URGENT:
      return 'Khẩn cấp';
    default:
      return priority;
  }
};

export const getActivityPriorityColor = (priority: ActivityPriority): string => {
  switch (priority) {
    case ActivityPriority.LOW:
      return 'green';
    case ActivityPriority.MEDIUM:
      return 'blue';
    case ActivityPriority.HIGH:
      return 'orange';
    case ActivityPriority.URGENT:
      return 'red';
    default:
      return 'default';
  }
};

export const getActivityTypeLabel = (type: ActivityType): string => {
  switch (type) {
    case ActivityType.TASK:
      return 'Công việc';
    case ActivityType.EVENT:
      return 'Sự kiện';
    default:
      return type;
  }
};

export const getActivityCategoryLabel = (category: ActivityCategory): string => {
  switch (category) {
    case ActivityCategory.SEMINAR:
      return 'Hội thảo';
    case ActivityCategory.WORKSHOP:
      return 'Workshop';
    case ActivityCategory.TUTOR:
      return 'Dạy kèm';
    default:
      return category;
  }
};

export const getFileIcon = (fileName: any) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📋';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️';
    case 'zip':
    case 'rar':
    case '7z':
      return '🗜️';
    case 'txt':
      return '📃';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎬';
    case 'mp3':
    case 'wav':
      return '🎵';
    default:
      return '📎';
  }
};

export const formatFileSize = (bytes: any) => {
  if (!bytes) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getColorFromName = (name: any) => {
  const colors = [
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#87d068',
    '#108ee9',
    '#f56a00',
    '#722ed1',
    '#eb2f96',
    '#52c41a',
    '#1890ff',
    '#fa541c',
    '#13c2c2',
    '#a0d911',
    '#fa8c16',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Hàm lấy chữ cái đầu từ tên
export const getInitials = (name: any) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word: any) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// useVisibleColumns.ts
export function useLocalStorageState<T>(storageKey: string, defaultValue: T) {
  const loadValue = (): T => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(loadValue);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.warn('Could not save setting to localStorage:', error);
    }
  }, [storageKey, value]);

  return { value, setValue };
}

export function calculateProgress(activity: IActivity): number {
  const hasSubActivities = (activity.subActivities?.length ?? 0) > 0;
  const hasChecklists = (activity.checklists?.length ?? 0) > 0;

  if (!hasSubActivities && !hasChecklists) {
    return activity.stage?.isCompleted ? 100 : 0;
  }

  let totalWeight = 0;
  let completedWeight = 0;

  if (hasSubActivities) {
    const subTaskCount = (activity.subActivities ?? []).length;
    const subTaskWeight = 100 / (subTaskCount + 1);

    // Tính progress của các subtask
    (activity.subActivities ?? []).forEach(subActivity => {
      totalWeight += subTaskWeight;
      if (subActivity.stage?.isCompleted) {
        completedWeight += subTaskWeight;
      }
    });

    // Thêm weight cho task chính
    totalWeight += subTaskWeight;
    if (activity.stage?.isCompleted) {
      completedWeight += subTaskWeight;
    }
  }

  // Case 3: Task có checklists
  if (hasChecklists) {
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;

    (activity.checklists ?? []).forEach(checklist => {
      if (checklist.items?.length > 0) {
        checklist.items.forEach(item => {
          totalChecklistItems++;
          if (item.isDone) {
            completedChecklistItems++;
          }
        });
      }
    });

    if (totalChecklistItems > 0) {
      // Nếu có cả subtask và checklist, chia weight
      if (hasSubActivities) {
        const checklistWeight = 50;
        const subTaskActualWeight = 50;

        // Rescale subtask progress
        const subTaskProgress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
        completedWeight = (subTaskProgress * subTaskActualWeight) / 100;
        totalWeight = subTaskActualWeight;

        // Add checklist progress
        const checklistProgress = (completedChecklistItems / totalChecklistItems) * checklistWeight;
        completedWeight += checklistProgress;
        totalWeight += checklistWeight;
      } else {
        // Chỉ có checklist
        const itemWeight = 100 / (totalChecklistItems + 1); // +1 cho task chính

        completedWeight = completedChecklistItems * itemWeight;
        totalWeight = totalChecklistItems * itemWeight;

        // Thêm weight cho task chính
        totalWeight += itemWeight;
        if (activity.stage?.isCompleted) {
          completedWeight += itemWeight;
        }
      }
    }
  }

  // Tính phần trăm cuối cùng
  const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  // Làm tròn đến 2 chữ số thập phân
  return Math.round(progress * 100) / 100;
}
