import { IUser } from '@/common/types';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useInvalidate, useUpdate } from '@refinedev/core';
import { IconDots, IconEdit, IconEye, IconUserExclamation } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDrawer } from './UserDrawer';
import { UserRole } from '@/common/enum/user';


interface UserRowActionsProps {
  user: IUser;
}

export const UserRowActions: FC<UserRowActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus } = useUserPermissions(user);
  const { mutate: updateUser } = useUpdate();
  const invalidate = useInvalidate();
  const { user: identity } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: `view-${user.id}`,
      icon: <IconEye size={18} />,
      label: 'Xem chi tiết',
      onClick: () => setDrawerOpen(true),
    },
  ];

  // Nếu là CNBM thì luôn hiển thị nút sửa cho mọi user
  if (identity?.role === UserRole.CNBM) {
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

  if (canToggleStatus) {
    menuItems.push(
      {
        type: 'divider',
      },
      {
        key: 'toggle-status',
        icon: <IconUserExclamation size={18} />,
        label: user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
        onClick: () => {
          updateUser(
            {
              resource: `users`,
              id: `${user.id}/toggle-active`,
              values: { isActive: !user.isActive },
              successNotification: false,
              errorNotification: false,
            },
            {
              onSuccess: () => {
                message.success(
                  `Đã ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} người dùng thành công!`,
                );
                invalidate({ resource: 'users/all', invalidates: ['list'] });
              },
              onError: error => {
                message.error(error?.message || 'Có lỗi xảy ra!');
              },
            },
          );
        },
      },
    );
  }

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="text" icon={<IconDots size={18} />} />
      </Dropdown>
      {drawerOpen && (
        <UserDrawer id={user.id} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
};
function useAuth(): { user: any } {
  const user = JSON.parse(localStorage.getItem('authUser') || 'null');
  return { user };
}

