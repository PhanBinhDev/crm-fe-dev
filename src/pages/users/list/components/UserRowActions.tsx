import { FC } from 'react';
import { Dropdown, Button, MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { IUser } from '@/common/types';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserRowActionsProps {
  user: IUser;
}

export const UserRowActions: FC<UserRowActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus } = useUserPermissions(user);

  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => navigate(`/users/show/${user.id}`),
    },
  ];

  if (canEdit) {
    menuItems.push({
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => navigate(`/users/edit/${user.id}`),
    });
  }

  if (canToggleStatus) {
    menuItems.push(
      {
        type: 'divider',
      },
      {
        key: 'toggle-status',
        icon: <UserSwitchOutlined />,
        label: user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
        onClick: () => {
          // TODO: Implement toggle user status
          console.log('Toggle status for user:', user.id);
        },
      },
    );
  }

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};
