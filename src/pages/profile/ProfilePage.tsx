'use client';

import type React from 'react';

import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Spin,
  Upload,
  Input,
  DatePicker,
  message,
  Result,
  Skeleton,
  Tabs,
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
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafafa',
          minHeight: '500px',
        }}
      >
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Skeleton.Avatar active size={80} style={{ marginBottom: 16 }} />
          <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 12 }} />
          <Skeleton.Button active style={{ width: 140, marginBottom: 24 }} />
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy thông tin người dùng"
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
    const hasChanged =
      editData.phone !== (identity.phone || '') ||
      editData.username !== (identity.username || '') ||
      editData.major !== (identity.major || '') ||
      (editData.dateOfBirth || '') !== (identity.dateOfBirth || '');

    if (!hasChanged) {
      setIsEditing(false);
      return;
    }

    updateUser(
      {
        resource: 'users',
        id: identity.id,
        values: editData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          message.success('Cập nhật thông tin thành công');
        },
        onError: () => {
          message.error('Cập nhật thông tin thất bại');
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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        minHeight: '500px',
      }}
    >
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: '100%',
          }}
        >
          {/* Avatar with upload functionality */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Upload
              name="avatar"
              showUploadList={false}
              accept=".jpg,.jpeg,.png"
              disabled={uploading}
              customRequest={handleAvatarUpload}
            >
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Avatar
                  size={80}
                  src={avatarUrl}
                  icon={<IconUser size={32} stroke={1.5} />}
                  style={{ backgroundColor: '#667EEA', border: '2px solid #fff' }}
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
                    <Spin />
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
                bottom: 1,
                right: 1,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: identity.isActive ? '#10B981' : '#EF4444',
                border: '2px solid #fff',
              }}
            />
          </div>

          {/* Name and info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={5} style={{ marginBottom: 2, fontSize: 19, fontWeight: 600 }}>
              {identity.name}
            </Title>
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Chuyên ngành: {identity.major || 'Chưa cập nhật'}
            </Text>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '12px 20px 20px',
        }}
      >
        <Tabs
          defaultActiveKey="contact"
          size="middle"
          style={{
            height: '100%',
          }}
          tabBarStyle={{
            marginBottom: 12,
            paddingLeft: '12px',
            paddingRight: '12px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0f0f0',
          }}
          items={[
            {
              key: 'contact',
              label: (
                <Space
                  styles={{
                    item: {
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <IconUser size={18} stroke={1.5} />
                  <span>Thông tin liên hệ</span>
                </Space>
              ),
              children: (
                <Card
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
                    body: { padding: '24px' },
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
              ),
            },
            {
              key: 'account',
              label: (
                <Space
                  styles={{
                    item: {
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <IconCalendar size={18} stroke={1.5} />
                  <span>Thông tin tài khoản</span>
                </Space>
              ),
              children: (
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  }}
                  styles={{
                    body: { padding: '24px' },
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
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
