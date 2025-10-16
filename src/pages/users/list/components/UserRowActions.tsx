import { IUser } from '@/common/types';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import { IconDots, IconEdit, IconEye, IconTrash, IconUserExclamation } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDrawer } from './UserDrawer';

interface UserRowActionsProps {
  user: IUser;
}

export const UserRowActions: FC<UserRowActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus, canDelete } = useUserPermissions(user);
  const { mutate: updateUser } = useUpdate();
  const { mutate: deleteUser } = useDelete();
  const invalidate = useInvalidate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: `view-${user.id}`,
      icon: <IconEye size={18} />,
      label: 'Xem chi tiết',
      onClick: () => setDrawerOpen(true),
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
    menuItems.push({
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
    });
  }

  if (canDelete) {
    menuItems.push(
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <IconTrash color="red" size={18} />,
        label: 'Xoá người dùng',
        onClick: () => {
          handleDeleteUser(user.id);
        },
      },
    );
  }

  const handleDeleteUser = (id: string) => {
    const hideLoading = message.loading('Đang xoá...', 0);
    deleteUser(
      {
        resource: `users`,
        id: id,
      },
      {
        onSuccess: () => {
          hideLoading();
          invalidate({
            resource: `users`,
            invalidates: ['list', 'detail', 'many'],
          });
          message.success('Xóa thành công');
        },
        onError: () => {
          hideLoading();
          message.error('Xóa thất bại');
        },
      },
    );
  };

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
