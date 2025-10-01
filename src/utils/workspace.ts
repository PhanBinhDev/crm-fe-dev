import { MemberRole } from '@/common/enum/workspace';

export const getWorkspaceRoleLabel = (role: MemberRole): string => {
  switch (role) {
    case MemberRole.OWNER:
      return 'Sở hữu';
    case MemberRole.ADMIN:
      return 'Thành viên';
    case MemberRole.MEMBER:
      return 'Admin';
    default:
      return role;
  }
};
