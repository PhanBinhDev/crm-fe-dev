import { Card, Avatar, Typography, Space, Button, Divider, Tag, Descriptions, Spin } from 'antd';
import { EditOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <Title level={4}>Không tìm thấy thông tin người dùng</Title>
        <Text type="secondary">Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.</Text>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center" size="large">
            <Avatar
              size={80}
              src={AVATAR_PLACEHOLDER}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <Title level={3} style={{ marginBottom: 0 }}>
                {user.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {user.role}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={user.isActive ? 'success' : 'error'}>
                  {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
            </div>
          </Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/edit/${user.id}`)}
          >
            Chỉnh sửa
          </Button>
        </Space>

        <Divider />

        <Descriptions
          column={1}
          labelStyle={{ fontWeight: 600, width: 120, color: '#666' }}
          contentStyle={{ fontSize: 16 }}
        >
          <Descriptions.Item label={<MailOutlined />}>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </Descriptions.Item>
          <Descriptions.Item label={<PhoneOutlined />}>
            <a href={`tel:${user.phone}`}>{user.phone}</a>
          </Descriptions.Item>  
          {/* <Descriptions.Item label="ID">
            <h1>PH123</h1>
          </Descriptions.Item> */}
          <Descriptions.Item label="Ngày tạo">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </div>
  );
};
