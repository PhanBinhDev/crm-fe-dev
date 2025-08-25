import { FC } from 'react';
import { Dropdown, Button, MenuProps, message } from 'antd';
import { IconDots, IconEye, IconEdit, IconUserExclamation } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IUser } from '@/common/types';
import { useUpdate, useInvalidate } from '@refinedev/core';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserRowActionsProps {
  user: IUser;
}

export const UserRowActions: FC<UserRowActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus } = useUserPermissions(user);
  const { mutate: updateUser } = useUpdate();
  const invalidate = useInvalidate();

  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      icon: <IconEye size={18} />,
      label: 'Xem chi tiết',
      onClick: () => navigate(`/teachers/show/${user.id}`),
    },
  ];

  if (canEdit) {
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
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<IconDots size={18} />} />
    </Dropdown>
  );
};
