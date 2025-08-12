import React, { useState } from 'react';
import { Button, Card, Typography, Space, Select } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const GoogleLoginPage: React.FC = () => {
  const [campus, setCampus] = useState<string | undefined>(undefined);
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
        background: '#f0f2f5',
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
        styles={{
          body: { padding: '40px 32px' },
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo/Icon */}
          <img
            src="/logo.png"
            alt="Logo"
            height={70}
            style={{ marginBottom: '24px', objectFit: 'contain' }}
          />

          {/* Title */}
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Đăng nhập vào CRM</h2>

          {/* Select campus */}
          <Select
            placeholder="Chọn cơ sở FPT Polytechnic"
            value={campus}
            onChange={setCampus}
            style={{ width: '100%', textAlign: 'left' }}
            allowClear
          >
            <Select.Option value="HaNoi">Hà Nội</Select.Option>
            <Select.Option value="HaNam">Hà Nam</Select.Option>
            <Select.Option value="DaNang">Đà Nẵng</Select.Option>
            <Select.Option value="HCM">Hồ Chí Minh</Select.Option>
            <Select.Option value="CanTho">Cần Thơ</Select.Option>
          </Select>

          {/* Google Login Button */}
          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              height: '40px',
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
        </Space>
      </Card>
    </div>
  );
};
