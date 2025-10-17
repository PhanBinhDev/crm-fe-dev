import { IconCrown, IconShield, IconUser, IconUsers } from '@tabler/icons-react';

export const MemberRolesFilter = [
  { label: 'Tất cả vai trò', value: 'all', icon: <IconUsers size={14} color="#333" /> },
  { label: 'Chủ sở hữu', value: 'owner', icon: <IconCrown size={14} color="#333" /> },
  { label: 'Quản trị viên', value: 'admin', icon: <IconShield size={14} color="#333" /> },
  { label: 'Thành viên', value: 'member', icon: <IconUser size={14} color="#333" /> },
];
