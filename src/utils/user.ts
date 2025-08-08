import { UserRole } from '@/common/enum/user';

export const getUserRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.TM:
      return 'Trưởng môn';
    case UserRole.CNBM:
      return 'Chủ nhiệm bộ môn';
    case UserRole.GV:
      return 'Giáo viên';
    default:
      return role;
  }
};

export const getUserRoleColor = (role: UserRole): string => {
  switch (role) {
    case UserRole.TM:
      return 'red';
    case UserRole.CNBM:
      return 'blue';
    case UserRole.GV:
      return 'green';
    default:
      return 'default';
  }
};

export const getUserStatusLabel = (isActive: boolean): string => {
  return isActive ? 'Đang hoạt động' : 'Không hoạt động';
};

export const getUserStatusColor = (isActive: boolean): string => {
  return isActive ? 'success' : 'error';
};
