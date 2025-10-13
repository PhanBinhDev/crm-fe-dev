'use client';
import type { IFileUploadResponse, IUser } from '@/common/types';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { getMajorOptionsForRole } from '@/utils/majorGroups';
import { useCustomMutation, useInvalidate, useOne, useUpdate } from '@refinedev/core';
import {
  IconCalendar,
  IconCamera,
  IconCheck,
  IconClock,
  IconEdit,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCircle,
  IconUserShield,
  IconX,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Input,
  Result,
  Select,
  Skeleton,
  Space,
  Spin,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const invalidate = useInvalidate();

  const {
    data: userDetail,
    isLoading: userLoading,
    refetch,
  } = useOne<IUser>({
    resource: 'users',
    id: authUser?.id || '',
    queryOptions: {
      enabled: !!authUser?.id,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticData, setOptimisticData] = useState<Partial<IUser> | null>(null);

  const identity = userDetail?.data || authUser;
  const isLoading = authLoading || userLoading;

  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PLACEHOLDER);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: '',
    username: '',
    dateOfBirth: '',
    major: '',
  });

  const { mutate: uploadFile } = useCustomMutation<IFileUploadResponse>();
  const { mutate: updateUser } = useUpdate<IUser>();

  // Get major options based on user's role
  const majorOptions = useMemo(() => {
    if (!identity?.role) return [];
    return getMajorOptionsForRole(identity.role);
  }, [identity?.role]);

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
    setIsSaving(true);
    setOptimisticData(editData);
    setIsEditing(false);

    updateUser(
      {
        resource: 'users',
        id: identity.id,
        values: editData,
      },
      {
        onSuccess: () => {
          invalidate({
            resource: 'users',
            invalidates: ['detail'],
          });
        },
        onError: () => {
          setOptimisticData(null);
          setIsEditing(true);
        },
        onSettled: () => {
          setIsSaving(false);
          setOptimisticData(null);
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
    const { file, onSuccess, onError } = options;
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
                invalidate({
                  resource: 'auth',
                  invalidates: ['all'],
                });
                invalidate({
                  resource: 'users',
                  invalidates: ['all'],
                });
                refetch();
              },
              onError: error => {
                setUploading(false);
                onError?.(error as any);
              },
            },
          );
        },
        onError: error => {
          setUploading(false);
          onError?.(error as any);
        },
      },
    );
  };

  const handleAvatarError = () => {
    setAvatarUrl(AVATAR_PLACEHOLDER);
  };

  const currentIdentity = optimisticData ? { ...identity, ...optimisticData } : identity;

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
                  src={avatarUrl !== AVATAR_PLACEHOLDER ? avatarUrl : undefined}
                  icon={<IconUser size={32} stroke={1.5} />}
                  style={{ backgroundColor: '#667EEA', border: '2px solid #fff' }}
                  onError={() => {
                    handleAvatarError();
                    return false;
                  }}
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
                backgroundColor: currentIdentity.isActive ? '#10B981' : '#EF4444',
                border: '2px solid #fff',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={5} style={{ marginBottom: 2, fontSize: 19, fontWeight: 600 }}>
              {currentIdentity.name}
            </Title>
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Chuyên ngành: {currentIdentity.major || 'Chưa cập nhật'}
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
                      {(isEditing || isSaving) && (
                        <>
                          <Button
                            type="text"
                            size="small"
                            icon={
                              isSaving ? (
                                <Spin size="small" />
                              ) : (
                                <IconCheck size={16} stroke={1.5} />
                              )
                            }
                            onClick={!isSaving ? handleSave : undefined}
                            style={{ color: '#10B981' }}
                            disabled={isSaving}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<IconX size={16} stroke={1.5} />}
                            onClick={handleEditToggle}
                            style={{ color: '#EF4444' }}
                            disabled={isSaving}
                          />
                        </>
                      )}
                      {!isEditing && !isSaving && (
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
                          href={`mailto:${currentIdentity.email}`}
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: '#1F2937',
                            textDecoration: 'none',
                          }}
                        >
                          {currentIdentity.email}
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
                            onPressEnter={handleSave}
                            placeholder="Nhập số điện thoại"
                            style={{ fontSize: 15, fontWeight: 500 }}
                          />
                        ) : (
                          <a
                            href={`tel:${currentIdentity.phone}`}
                            style={{
                              fontSize: 15,
                              fontWeight: 500,
                              color: '#1F2937',
                              textDecoration: 'none',
                            }}
                          >
                            {currentIdentity.phone || '-'}
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
                            onPressEnter={handleSave}
                            placeholder="Nhập username"
                            style={{ fontSize: 15, fontWeight: 500 }}
                          />
                        ) : (
                          <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                            {currentIdentity.username || '-'}
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
                              handleInputChange(
                                'dateOfBirth',
                                date ? date.format('YYYY-MM-DD') : '',
                              )
                            }
                            placeholder="Chọn ngày sinh"
                            style={{ width: '100%', fontSize: 15, fontWeight: 500 }}
                            format={'DD/MM/YYYY'}
                          />
                        ) : (
                          <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                            {currentIdentity.dateOfBirth
                              ? dayjs(currentIdentity.dateOfBirth).format('DD/MM/YYYY')
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
                          <Select
                            value={editData.major}
                            onChange={value => handleInputChange('major', value)}
                            placeholder="Chọn chuyên ngành"
                            style={{ width: '100%', fontSize: 15, fontWeight: 500 }}
                            options={majorOptions}
                            showSearch
                            filterOption={(input, option: any) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                          />
                        ) : (
                          <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>
                            {currentIdentity.major || '-'}
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
                          {currentIdentity.createdAt
                            ? new Date(currentIdentity.createdAt).toLocaleDateString('vi-VN', {
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
                          {currentIdentity.updatedAt
                            ? new Date(currentIdentity.updatedAt).toLocaleDateString('vi-VN', {
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
