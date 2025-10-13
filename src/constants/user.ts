import { UserRole } from '@/common/enum/user';

export const userStatusFilterOptions = [
  { label: 'Hoạt động', value: true },
  { label: 'Vô hiệu hóa', value: false },
];

export const userStatusLabels = {
  true: 'Hoạt động',
  false: 'Vô hiệu hóa',
};

export const getUserStatusLabel = (isActive: boolean): string => {
  return userStatusLabels[isActive.toString() as keyof typeof userStatusLabels] || 'Không xác định';
};

export const userRoles = [
  {
    value: UserRole.SUPERADMIN,
    label: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
  },
  { value: UserRole.TM, label: 'Trưởng môn', description: 'Quản lý các ngành trong nhóm' },
  {
    value: UserRole.CNBM,
    label: 'Chủ nhiệm bộ môn',
    description: 'Quản lý giảng viên cùng bộ môn',
  },
  { value: UserRole.GV, label: 'Giảng viên', description: 'Giảng viên' },
];

export const userRoleFilterOptions = userRoles.map(role => ({
  label: role.label,
  value: role.value,
}));

export const getUserRoleLabel = (role: UserRole): string => {
  const roleData = userRoles.find(r => r.value === role);
  return roleData?.label || role;
};
