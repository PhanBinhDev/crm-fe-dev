'use client';
import type { IUser } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { getUserRoleLabel } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import { getColorFromName, getInitials } from '@/utils/activity';
import { getMajorOptionsForRole } from '@/utils/majorGroups';
import { useCustomMutation, useInvalidate, useOne } from '@refinedev/core';
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
  Tabs,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

const { Title, Text } = Typography;

interface IFormData {
  phone: string;
  username: string;
  dateOfBirth: string;
  major: string;
}

const pickEditableFields = (obj: any): IFormData => ({
  phone: obj.phone || '',
  username: obj.username || '',
  dateOfBirth: obj.dateOfBirth || '',
  major: obj.major || '',
});

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

  const identity = userDetail?.data || authUser;
  const isLoading = authLoading || userLoading;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<IFormData>({
    phone: '',
    username: '',
    dateOfBirth: '',
    major: '',
  });
  const [initialDataState, setInitialDataState] = useState<IFormData>({
    phone: '',
    username: '',
    dateOfBirth: '',
    major: '',
  });
  const [optimisticData, setOptimisticData] = useState<Partial<IUser> | null>(null);

  const { mutate: updateUser, isPending: isUpdating } = useCustomMutation();

  const majorOptions = useMemo(() => {
    if (!identity?.role) return [];
    return getMajorOptionsForRole(identity.role);
  }, [identity?.role]);

  useEffect(() => {
    if (identity) {
      const newAvatarPreview = identity.avatar || undefined;
      if (
        avatarPreview &&
        avatarPreview.startsWith('blob:') &&
        newAvatarPreview !== avatarPreview
      ) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(newAvatarPreview);
      setAvatarFile(null);

      const initialData = pickEditableFields(identity);
      setFormData(initialData);
      setInitialDataState(initialData);
    }

    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [identity]);

  const hasChanges = useMemo(() => {
    if (!identity || (!initialDataState.phone && !initialDataState.username)) return false;

    const formChanged = !isEqual(
      pickEditableFields(formData),
      pickEditableFields(initialDataState),
    );

    const avatarChanged = avatarFile !== null;

    return formChanged || avatarChanged;
  }, [formData, initialDataState, avatarFile, identity]);

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
      setFormData(initialDataState);
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(identity.avatar || undefined);
      setAvatarFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    const changedFields = Object.entries(pickEditableFields(formData)).filter(
      ([key, value]) => value !== initialDataState[key as keyof IFormData],
    );

    const formDataToSend = new FormData();
    changedFields.forEach(([key, value]) => {
      formDataToSend.append(key, value as any);
    });

    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    const optimisticUpdate: Partial<IUser> = {
      ...formData,
    };
    if (avatarPreview) {
      optimisticUpdate.avatar = avatarPreview;
    }
    setOptimisticData(optimisticUpdate);
    setIsEditing(false);

    updateUser(
      {
        url: `users/profile`,
        method: 'patch',
        values: formDataToSend,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật thông tin thành công');
          setAvatarFile(null);
          setInitialDataState(pickEditableFields(formData));
          refetch();

          invalidate({
            resource: 'users',
            invalidates: ['detail'],
            id: identity.id,
          });
          invalidate({
            resource: 'auth',
            invalidates: ['all'],
          });
        },
        onError: () => {
          message.error('Có lỗi xảy ra khi cập nhật thông tin');
          setOptimisticData(null);
          setIsEditing(true);
        },
        onSettled: () => {
          setOptimisticData(null);
        },
      },
    );
  };

  const handleInputChange = (field: keyof IFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = (options: UploadRequestOption) => {
    const { file } = options;

    if (!(file as File).type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh!');
      return;
    }
    if ((file as File).size / 1024 / 1024 > 5) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return;
    }

    setAvatarFile(file as File);
    setAvatarPreview(URL.createObjectURL(file as File));
  };

  const handleAvatarError = () => {
    setAvatarPreview(AVATAR_PLACEHOLDER);
  };

  const displayAvatar = avatarPreview || identity.avatar;
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
          padding: '12px 25px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
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
              accept="image/*"
              disabled={!isEditing}
              customRequest={handleAvatarUpload}
            >
              <div style={{ position: 'relative', cursor: isEditing ? 'pointer' : 'default' }}>
                <Avatar
                  size={80}
                  src={
                    displayAvatar && displayAvatar !== AVATAR_PLACEHOLDER
                      ? displayAvatar
                      : undefined
                  }
                  style={{
                    backgroundColor:
                      displayAvatar && displayAvatar !== AVATAR_PLACEHOLDER
                        ? '#ffffff'
                        : getColorFromName(identity?.name),
                    color:
                      displayAvatar && displayAvatar !== AVATAR_PLACEHOLDER
                        ? 'transparent'
                        : '#fff',
                    fontSize: 48,
                    fontWeight: 600,
                    transition: 'opacity 0.3s',
                    border: 'none',
                  }}
                  onError={() => {
                    handleAvatarError();
                    return false;
                  }}
                >
                  {(!displayAvatar || displayAvatar === AVATAR_PLACEHOLDER) &&
                    getInitials(identity?.name)}
                </Avatar>
                {isEditing && (
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
                )}
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
              Chức vụ: {getUserRoleLabel(currentIdentity.role) || 'Chưa cập nhật'}
            </Text>
          </div>
        </div>

        <Space>
          {(isEditing || isUpdating) && (
            <Tooltip title={isEditing ? 'Lưu thay đổi' : 'Đang cập nhật...'}>
              <Button
                type="text"
                size="small"
                icon={isUpdating ? <Spinner /> : <IconCheck size={16} stroke={1.5} />}
                onClick={!isUpdating ? handleSave : undefined}
                style={{ color: '#10B981' }}
                disabled={isUpdating || !hasChanges}
              />
              <Button
                type="text"
                size="small"
                icon={<IconX size={16} stroke={1.5} />}
                onClick={handleEditToggle}
                style={{ color: '#EF4444' }}
                disabled={isUpdating}
              />
            </Tooltip>
          )}
          {!isEditing && !isUpdating && (
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                size="small"
                icon={<IconEdit size={16} stroke={1.5} />}
                onClick={handleEditToggle}
                style={{ color: '#667EEA' }}
              />
            </Tooltip>
          )}
        </Space>
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
                <Card>
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
                            value={formData.phone}
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
                          Mã giảng viên
                        </Text>
                        {isEditing ? (
                          <Input
                            value={formData.username}
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
                            value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
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
                            value={formData.major || undefined}
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
