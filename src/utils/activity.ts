import {
  AssigneeRole,
  AssignmentStatus,
  ActivityStatus,
  ActivityPriority,
  ActivityType,
  ActivityCategory,
} from '@/common/enum/activity';

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
      return 'Nhiệm vụ';
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
