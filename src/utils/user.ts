import { UserRole } from '@/common/enum/user';

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

export const getUserStatusLabel = (isActive?: boolean): string => {
  if (isActive === true) return 'Đang hoạt động';
  if (isActive === false) return 'Không hoạt động';
  return 'Không xác định';
};

export const getUserStatusColor = (isActive: boolean): string => {
  return isActive ? 'success' : 'error';
};
