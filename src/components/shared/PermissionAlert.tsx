import { Alert, Space, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { UserRole } from '@/common/enum/user';

const { Text } = Typography;

interface PermissionAlertProps {
  userRole: UserRole;
  action: 'create' | 'edit' | 'delete' | 'toggle-status';
  targetRole?: UserRole;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({
  userRole,
  action,
  targetRole,
}) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.TM:
        return 'Trưởng môn';
      case UserRole.CNBM:
        return 'Chủ nhiệm bộ môn';
      case UserRole.GV:
        return 'Giáo viên';
      default:
        return role;
    }
  };

  const getPermissionMessage = () => {
    switch (action) {
      case 'create':
        return {
          title: 'Không có quyền tạo người dùng',
          description: 'Chỉ Trưởng môn và Chủ nhiệm bộ môn mới có thể tạo người dùng mới.',
        };
      case 'edit':
        return {
          title: 'Không có quyền chỉnh sửa',
          description:
            'Bạn chỉ có thể chỉnh sửa thông tin cá nhân của mình. Trưởng môn có thể chỉnh sửa thông tin của tất cả người dùng.',
        };
      case 'delete':
        return {
          title: 'Không có quyền xóa người dùng',
          description: 'Chỉ Trưởng môn mới có thể xóa người dùng.',
        };
      case 'toggle-status':
        const targetRoleLabel = targetRole ? getRoleLabel(targetRole) : '';
        return {
          title: 'Không có quyền thay đổi trạng thái',
          description: `Trưởng môn có thể thay đổi trạng thái tất cả người dùng. Chủ nhiệm bộ môn chỉ có thể thay đổi trạng thái của Giáo viên.${
            targetRole ? ` Bạn không thể thay đổi trạng thái của ${targetRoleLabel}.` : ''
          }`,
        };
      default:
        return {
          title: 'Không có quyền thực hiện',
          description: 'Bạn không có quyền thực hiện hành động này.',
        };
    }
  };

  const { title, description } = getPermissionMessage();

  return (
    <Alert
      type="warning"
      showIcon
      icon={<InfoCircleOutlined />}
      message={
        <Space direction="vertical" size={4}>
          <Text strong>{title}</Text>
          <Text type="secondary">{description}</Text>
          <Text type="secondary">
            Vai trò hiện tại: <Text strong>{getRoleLabel(userRole)}</Text>
          </Text>
        </Space>
      }
      style={{ marginBottom: 16 }}
    />
  );
};
