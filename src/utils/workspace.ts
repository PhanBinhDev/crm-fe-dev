import { MemberRole } from '@/common/enum/workspace';

export const getWorkspaceRoleLabel = (role: MemberRole): string => {
  switch (role) {
    case MemberRole.OWNER:
      return 'Chủ sở hữu';
    case MemberRole.ADMIN:
      return 'Quản trị viên';
    case MemberRole.MEMBER:
      return 'Thành viên';
    default:
      return role;
  }
};

export const getColumnNameByTab = (tab: 'active' | 'invited' | 'requested'): string => {
  switch (tab) {
    case 'active':
      return 'Hoạt động';
    case 'invited':
      return 'Đã mời';
    case 'requested':
      return 'Yêu cầu tham gia';
  }
};
