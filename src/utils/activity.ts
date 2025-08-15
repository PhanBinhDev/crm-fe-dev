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
