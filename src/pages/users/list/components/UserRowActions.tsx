import { FC, useState } from 'react';
import { Dropdown, Button, MenuProps, Modal, message } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, UserSwitchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { IUser } from '@/common/types';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { UserService } from '@/services/api/user';

interface UserRowActionsProps {
  user: IUser;
  onUserUpdated?: () => void; // Callback to refresh user list
}

export const UserRowActions: FC<UserRowActionsProps> = ({ user, onUserUpdated }) => {
  const navigate = useNavigate();
  const { canEdit, canToggleStatus, canDelete } = useUserPermissions(user);
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await UserService.updateUser(user.id, { isActive: !user.isActive });
      message.success(`Đã ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} người dùng thành công!`);
      onUserUpdated?.(); // Refresh user list
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await UserService.deleteUser(user.id);
      message.success('Đã xóa người dùng thành công!');
      onUserUpdated?.(); // Refresh user list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Xác nhận xóa người dùng',
      content: `Bạn có chắc chắn muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
    });
  };

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
        onClick: handleToggleStatus,
        disabled: loading,
      },
    );
  }

  if (canDelete) {
    menuItems.push(
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa người dùng',
        onClick: showDeleteConfirm,
        disabled: loading,
      },
    );
  }

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} loading={loading} />
    </Dropdown>
  );
};
