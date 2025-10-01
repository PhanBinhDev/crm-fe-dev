import { MemberRole } from '@/common/enum/workspace';
import { IUser } from '@/common/types';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useInvalidate } from '@refinedev/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps } from 'antd';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface MemberRowActionsProps {
  user: IUser;
  role: string;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ user, role }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus } = useUserPermissions(user);
  const invalidate = useInvalidate();

  const menuItems: MenuProps['items'] = [
    {
      key: `view-${user.id}`,
      icon: <IconTrash size={18} />,
      label: 'Xoá thành viên',
      // onClick: () => setDrawerOpen(true),
    },
  ];

  // Nếu là CNBM thì luôn hiển thị nút sửa cho mọi user
  if (role === MemberRole.OWNER) {
    menuItems.push({
      key: 'edit',
      icon: <IconEdit size={18} />,
      label: 'Chỉnh sửa',
      onClick: () => navigate(`/teachers/edit/${user.id}`),
    });
  } else if (canEdit) {
    menuItems.push({
      key: 'edit',
      icon: <IconEdit size={18} />,
      label: 'Chỉnh sửa',
      onClick: () => navigate(`/teachers/edit/${user.id}`),
    });
  }

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="text" icon={<IconDots size={18} />} />
      </Dropdown>
    </>
  );
};
