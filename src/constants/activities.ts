import { ActivityPriority, ActivityStatus } from '@/common/enum/activity';

export const activityStatusFilterOptions = [
  { label: 'Mới', value: ActivityStatus.NEW },
  { label: 'Đang thực hiện', value: ActivityStatus.IN_PROGRESS },
  { label: 'Hoàn thành', value: ActivityStatus.COMPLETED },
  { label: 'Quá hạn', value: ActivityStatus.OVERDUE },
];

export const activityPriorityFilterOptions = [
  { label: 'Thấp', value: ActivityPriority.LOW },
  { label: 'Trung bình', value: ActivityPriority.MEDIUM },
  { label: 'Cao', value: ActivityPriority.HIGH },
  { label: 'Khẩn cấp', value: ActivityPriority.URGENT },
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
