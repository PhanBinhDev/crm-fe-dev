import { ActivityPriority, ActivityStatus, ActivityType } from '@/common/enum/activity';
import { ActivityPriorityLevel } from '@/common/types';

export const activityStatusFilterOptions = [
  { label: 'Mới', value: ActivityStatus.NEW },
  { label: 'Đang thực hiện', value: ActivityStatus.IN_PROGRESS },
  { label: 'Hoàn thành', value: ActivityStatus.COMPLETED },
  { label: 'Quá hạn', value: ActivityStatus.OVERDUE },
];

export const activityPriorityFilterOptions: ActivityPriorityLevel[] = [
  { label: 'Thấp', value: ActivityPriority.LOW, color: '#bdbdbd' },
  { label: 'Trung bình', value: ActivityPriority.MEDIUM, color: '#1976d2' },
  { label: 'Cao', value: ActivityPriority.HIGH, color: '#ffc107' },
  { label: 'Khẩn cấp', value: ActivityPriority.URGENT, color: '#e53935' },
];

// Helper functions
export const getStatusLabel = (status: ActivityStatus): string => {
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

export const getStatusColor = (status: ActivityStatus): string => {
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

export const getPriorityLabel = (priority: ActivityPriority): string => {
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

export const getPriorityColor = (priority: ActivityPriority): string => {
  switch (priority) {
    case ActivityPriority.LOW:
      return 'cyan';
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

export const priorityColors = {
  [ActivityPriority.LOW]: 'blue',
  [ActivityPriority.MEDIUM]: 'orange',
  [ActivityPriority.HIGH]: 'red',
  [ActivityPriority.URGENT]: 'purple',
};

export const PRESET_COLORS = [
  '#4338CA',
  '#1E40AF',
  '#0EA5E9',
  '#059669',
  '#10B981',
  '#22C55E',
  '#F59E0B',
  '#EA580C',
  '#DC2626',
  '#E11D48',
  '#9333EA',
  '#8B5CF6',
];

export const DragDropType = {
  KANBAN_COLUMN: 'kanban-column',
  KANBAN_CARD: 'kanban-card',
};

export const getActivityLabel = (type: ActivityType): string => {
  switch (type) {
    case ActivityType.TASK:
      return 'Công việc';
    case ActivityType.EVENT:
      return 'Sự kiện';
    default:
      return type;
  }
};
