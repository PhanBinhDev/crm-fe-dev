'use client';

import type React from 'react';

import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Tag,
  Row,
  Col,
  Spin,
  Upload,
  Input,
  DatePicker,
  message,
  Result,
  Skeleton,
} from 'antd';
import {
  IconEdit,
  IconMail,
  IconPhone,
  IconUser,
  IconCalendar,
  IconClock,
  IconCamera,
  IconUserCircle,
  IconUserShield,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useCustomMutation, useUpdate } from '@refinedev/core';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useEffect, useState } from 'react';
import type { IFileUploadResponse, IUser } from '@/common/types';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user: identity, isLoading } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PLACEHOLDER);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: '',
    username: '',
    dateOfBirth: '',
    major: '',
  });

  const { mutate: uploadFile } = useCustomMutation<IFileUploadResponse>();
  const { mutate: updateUser } = useUpdate<IUser>();

  useEffect(() => {
    if (identity?.avatar) {
      setAvatarUrl(identity.avatar);
    }
    if (identity) {
      setEditData({
        phone: identity.phone || '',
        username: identity.username || '',
        dateOfBirth: identity.dateOfBirth || '',
        major: identity.major || '',
      });
    }
  }, [identity]);

  if (isLoading) {
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
        <Skeleton.Avatar active size={120} style={{ marginBottom: 24 }} />
        <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 12 }} />
        <Skeleton.Button active style={{ width: 140, marginBottom: 24 }} />
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Col>
          <Col xs={24} lg={12}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (!identity) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy thông tin người dùng<"
        extra={<Button type="primary">Back Home</Button>}
      />
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        phone: identity.phone || '',
        username: identity.username || '',
        dateOfBirth: identity.dateOfBirth || '',
        major: identity.major || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    updateUser(
      {
        resource: 'users',
        id: identity.id,
        values: editData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
              errorNotification: false,
              successNotification: false,
            },
            {
              onSuccess: () => {
                setAvatarUrl(fullUrl);
                onSuccess?.(res.data, file as any);
                setUploading(false);
                message.success('Cập nhật thông tin thành công');
              },
            },
          );
        },
      },
    );
  };

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
        styles={{ body: { padding: '20px' } }}
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
                      icon={<IconUser size={64} stroke={1.5} />}
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
                      <IconCamera size={24} color="#fff" stroke={1.5} />
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
                  {identity.major}
                </Text>
                <div>
                  <Tag
                    color={identity.isActive ? 'green' : 'red'}
                    style={{
                      borderRadius: 8,
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
        </Row>
      </Card>

      {/* Content Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space
                align="center"
                style={{ display: 'flex', gap: 8 }}
                styles={{
                  item: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  },
                }}
              >
                <IconUser size={20} color="#667EEA" stroke={1.5} />
                <Text strong style={{ fontSize: 16 }}>
                  Thông tin liên hệ
                </Text>
              </Space>
            }
            extra={
              <Space>
                {isEditing && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      icon={<IconCheck size={16} stroke={1.5} />}
                      onClick={handleSave}
                      style={{ color: '#10B981' }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<IconX size={16} stroke={1.5} />}
                      onClick={handleEditToggle}
                      style={{ color: '#EF4444' }}
                    />
                  </>
                )}
                {!isEditing && (
                  <Button
                    type="text"
                    size="small"
                    icon={<IconEdit size={16} stroke={1.5} />}
                    onClick={handleEditToggle}
                    style={{ color: '#667EEA' }}
                  />
                )}
              </Space>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
            styles={{
              header: {
                borderBottom: '1px solid #F3F4F6',
                padding: '20px 24px',
              },
              body: {
                padding: '24px',
              },
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Email */}
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
                  <IconMail size={18} color="#667EEA" stroke={1.5} />
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
              {/* Phone */}
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
                  <IconPhone size={18} color="#667EEA" stroke={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Số điện thoại
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      style={{ fontSize: 15, fontWeight: 500 }}
                    />
                  ) : (
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
                  )}
                </div>
              </div>
              {/* Username */}
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
                  <IconUserCircle size={18} color="#667EEA" stroke={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Username
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editData.username}
                      onChange={e => handleInputChange('username', e.target.value)}
                      placeholder="Nhập username"
                      style={{ fontSize: 15, fontWeight: 500 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                      {identity.username || '-'}
                    </Text>
                  )}
                </div>
              </div>
              {/* Ngày sinh */}
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
                  <IconCalendar size={18} color="#667EEA" stroke={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Ngày sinh
                  </Text>
                  {isEditing ? (
                    <DatePicker
                      value={editData.dateOfBirth ? dayjs(editData.dateOfBirth) : null}
                      onChange={date =>
                        handleInputChange('dateOfBirth', date ? date.toISOString() : '')
                      }
                      placeholder="Chọn ngày sinh"
                      style={{ width: '100%', fontSize: 15, fontWeight: 500 }}
                      format="DD/MM/YYYY"
                    />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                      {identity.dateOfBirth
                        ? new Date(identity.dateOfBirth).toLocaleDateString('vi-VN')
                        : '-'}
                    </Text>
                  )}
                </div>
              </div>
              {/* Chuyên ngành */}
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
                  <IconUserShield size={18} color="#667EEA" stroke={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Chuyên ngành
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editData.major}
                      onChange={e => handleInputChange('major', e.target.value)}
                      placeholder="Nhập chuyên ngành"
                      style={{ fontSize: 15, fontWeight: 500 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                      {identity.major || '-'}
                    </Text>
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column - Account Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space
                align="center"
                style={{ display: 'flex', gap: 8 }}
                styles={{
                  item: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  },
                }}
              >
                <IconCalendar size={20} color="#667EEA" stroke={1.5} />
                <Text strong style={{ fontSize: 16 }}>
                  Thông tin tài khoản
                </Text>
              </Space>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
            styles={{
              body: { padding: '24px' },
              header: {
                padding: '20px 24px',
                borderBottom: '1px solid #F3F4F6',
              },
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Ngày tạo tài khoản */}
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
                  <IconCalendar size={18} color="#667EEA" stroke={1.5} />
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
              {/* Cập nhật lần cuối */}
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
                  <IconClock size={18} color="#667EEA" stroke={1.5} />
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
