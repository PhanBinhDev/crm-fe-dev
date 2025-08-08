import React from 'react';
import { Button, Card, Typography, Space, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface GoogleLoginPageProps {
  title?: string;
  subtitle?: string;
}

export const GoogleLoginPage: React.FC<GoogleLoginPageProps> = ({
  title = 'CRM CNTT - Đăng nhập',
  subtitle = 'Hệ thống quản lý giáo viên Khoa Công nghệ Thông tin',
}) => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo/Icon */}
          <div style={{ fontSize: '48px', color: '#1890ff' }}>🎓</div>

          {/* Title */}
          <div>
            <Title level={2} style={{ margin: 0, color: '#262626' }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {subtitle}
            </Text>
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* Google Login Button */}
          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              height: '48px',
              fontSize: '16px',
              backgroundColor: '#4285f4',
              borderColor: '#4285f4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#3367d6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#4285f4';
            }}
          >
            Đăng nhập với Google
          </Button>

          {/* Footer */}
          <Text type="secondary" style={{ fontSize: '12px', marginTop: '20px' }}>
            Dành cho Giáo viên • Chủ nhiệm Bộ môn • Trưởng môn
          </Text>
        </Space>
      </Card>
    </div>
  );
};
