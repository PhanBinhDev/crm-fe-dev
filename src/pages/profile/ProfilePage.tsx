import { Card, Avatar, Typography, Space, Button, Tag, Row, Col, Spin, Upload } from 'antd';
import {
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useCustomMutation, useGetIdentity, useUpdate } from '@refinedev/core';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IFile, IUser } from '@/common/types';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { data: identity, isLoading } = useGetIdentity<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>();

  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PLACEHOLDER);
  const navigate = useNavigate();

  const { mutate: uploadFile } = useCustomMutation<IFile>();
  const { mutate: updateUser } = useUpdate<IUser>();

  useEffect(() => {
    if (identity?.avatar) {
      setAvatarUrl(identity.avatar);
    }
  }, [identity]);

  if (isLoading) {
    return <Spin />;
  }

  if (!identity) {
    return <div>Không tìm thấy thông tin người dùng</div>;
  }

  const handleAvatarUpload = async (options: UploadRequestOption) => {
    const { file, onSuccess } = options;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file as Blob);

    uploadFile(
      {
        url: '/upload/file',
        method: 'post',
        values: formData,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: res => {
          const newUrl = res.data.url;
          const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${newUrl}`;
          updateUser(
            {
              resource: 'users',
              id: identity.id,
              values: { avatar: fullUrl },
            },
            {
              onSuccess: () => {
                setAvatarUrl(fullUrl);
                onSuccess?.(res.data, file as any);
                setUploading(false);
              },
            },
          );
        },
      },
    );
  };
  console.log('avatar', avatarUrl);
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large" align="start">
              <div style={{ position: 'relative' }}>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  accept=".jpg,.jpeg,.png"
                  disabled={uploading}
                  customRequest={handleAvatarUpload}
                >
                  <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <Avatar
                      size={120}
                      src={avatarUrl}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#667EEA', border: '4px solid #fff' }}
                    />
                    {uploading && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <CameraOutlined style={{ color: '#fff', fontSize: 24 }} />
                    </div>
                  </div>
                </Upload>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: identity.isActive ? '#10B981' : '#EF4444',
                    border: '3px solid #fff',
                  }}
                />
              </div>
              <Space direction="vertical" size="small">
                <Title level={2} style={{ marginBottom: 0, fontSize: 28, fontWeight: 600 }}>
                  {identity.name}
                </Title>
                <Text
                  style={{
                    fontSize: 18,
                    color: '#6B7280',
                    fontWeight: 500,
                  }}
                >
                  {identity.role}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Tag
                    color={identity.isActive ? 'green' : 'red'}
                    style={{
                      borderRadius: 16,
                      padding: '4px 12px',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                    }}
                  >
                    {identity.isActive ? '● Hoạt động' : '● Không hoạt động'}
                  </Tag>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/edit/${identity.id}`)}
              style={{
                borderRadius: 8,
                height: 44,
                paddingLeft: 24,
                paddingRight: 24,
                fontWeight: 500,
                fontSize: 15,
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
              }}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Content Section */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Contact Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#667EEA' }} />
                <Text strong style={{ fontSize: 16 }}>
                  Thông tin liên hệ
                </Text>
              </Space>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
            headStyle={{
              borderBottom: '1px solid #F3F4F6',
              padding: '20px 24px',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MailOutlined style={{ fontSize: 18, color: '#667EEA' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Email
                  </Text>
                  <a
                    href={`mailto:${identity.email}`}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#1F2937',
                      textDecoration: 'none',
                    }}
                  >
                    {identity.email}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhoneOutlined style={{ fontSize: 18, color: '#667EEA' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Số điện thoại
                  </Text>
                  <a
                    href={`tel:${identity.phone}`}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#1F2937',
                      textDecoration: 'none',
                    }}
                  >
                    {identity.phone}
                  </a>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column - Account Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#667EEA' }} />
                <Text strong style={{ fontSize: 16 }}>
                  Thông tin tài khoản
                </Text>
              </Space>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
            headStyle={{
              borderBottom: '1px solid #F3F4F6',
              padding: '20px 24px',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarOutlined style={{ fontSize: 18, color: '#667EEA' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Ngày tạo tài khoản
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                    {identity.createdAt
                      ? new Date(identity.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 18, color: '#667EEA' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Cập nhật lần cuối
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                    {identity.updatedAt
                      ? new Date(identity.updatedAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
