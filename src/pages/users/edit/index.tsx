import { UserRole } from '@/common/enum/user';
import { IUser } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { userRoleFilterOptions, userStatusFilterOptions } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import { getColorFromName } from '@/utils/activity';
import { canManageUser, getEditableRoles, getMajorOptionsForRole } from '@/utils/majorGroups';
import { useCustomMutation, useInvalidate, useOne } from '@refinedev/core';
import {
  IconArrowBackUp,
  IconDeviceFloppy,
  IconInfoHexagon,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMediaQuery } from 'usehooks-ts';

const { Text } = Typography;

interface IFormData {
  name: string;
  phone: string;
  username: string;
  email: string;
  role: UserRole;
  major: string;
  dateOfBirth: string;
  isActive: boolean;
}

const pickEditableFields = (obj: any): IFormData => ({
  name: obj.name || '',
  phone: obj.phone || '',
  username: obj.username || '',
  email: obj.email || '',
  role: obj.role || UserRole.GV,
  major: obj.major || '',
  dateOfBirth: obj.dateOfBirth || '',
  isActive: obj.isActive ?? true,
});

export const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user: authUser } = useAuth();
  const invalidate = useInvalidate();

  const {
    data: userDetail,
    isLoading,
    refetch,
  } = useOne<IUser>({
    resource: 'users',
    id: id || '',
    queryOptions: {
      enabled: !!id,
    },
  });

  const targetUser = userDetail?.data;
  const [dateError, setDateError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [formData, setFormData] = useState<IFormData>({
    name: '',
    phone: '',
    username: '',
    email: '',
    role: UserRole.GV,
    major: '',
    dateOfBirth: '',
    isActive: true,
  });
  const [initialDataState, setInitialDataState] = useState<IFormData>({
    name: '',
    phone: '',
    username: '',
    email: '',
    role: UserRole.GV,
    major: '',
    dateOfBirth: '',
    isActive: true,
  });

  const { mutate: updateUser, isPending: isUpdating } = useCustomMutation();

  const isEditingSelf = useMemo(() => {
    return authUser?.id === targetUser?.id;
  }, [authUser?.id, targetUser?.id]);

  const canManageTarget = useMemo(() => {
    if (!targetUser) return false;
    return canManageUser(
      authUser?.role,
      authUser?.major,
      targetUser?.role,
      targetUser?.major,
      authUser?.id,
      targetUser?.id,
      'edit',
    );
  }, [authUser, targetUser]);

  const canEditRole = useMemo(() => {
    if (!canManageTarget) return false;
    if (isEditingSelf) return false;

    const userRole = authUser?.role;
    const targetRole = targetUser?.role;

    if (userRole === UserRole.SUPERADMIN) return true;
    if (userRole === UserRole.TM) {
      if ([UserRole.SUPERADMIN, UserRole.TM].includes(targetRole as UserRole)) {
        return false;
      }
      return true;
    }
    return false;
  }, [authUser, targetUser, canManageTarget, isEditingSelf]);

  const canEditStatus = useMemo(() => {
    return canEditRole && !isEditingSelf;
  }, [canEditRole, isEditingSelf]);

  const canEditMajor = useMemo(() => {
    if (!canManageTarget) return false;

    const userRole = authUser?.role;
    const targetRole = targetUser?.role;

    if (userRole === UserRole.SUPERADMIN) return true;
    if (userRole === UserRole.TM) {
      if ([UserRole.SUPERADMIN, UserRole.TM].includes(targetRole as UserRole) && !isEditingSelf) {
        return false;
      }
      return true;
    }
    if (userRole === UserRole.CNBM) {
      return targetRole === UserRole.GV || isEditingSelf;
    }
    return isEditingSelf;
  }, [authUser, targetUser, canManageTarget, isEditingSelf]);

  const availableRoles = useMemo(() => {
    if (!targetUser) return [];

    const editableRoles = getEditableRoles(authUser?.role, targetUser?.role, isEditingSelf);

    if (editableRoles.length === 0) {
      return userRoleFilterOptions.filter(option => option.value === targetUser?.role);
    }

    return userRoleFilterOptions.filter(option => editableRoles.includes(option.value as UserRole));
  }, [authUser?.role, targetUser?.role, isEditingSelf, targetUser]);

  const majorOptions = useMemo(() => {
    if (!formData.role) return [];
    return getMajorOptionsForRole(formData.role);
  }, [formData.role]);

  useEffect(() => {
    if (targetUser) {
      const newAvatarPreview = targetUser.avatar || undefined;
      if (
        avatarPreview &&
        avatarPreview.startsWith('blob:') &&
        newAvatarPreview !== avatarPreview
      ) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(newAvatarPreview);
      setAvatarFile(null);

      const initialData = pickEditableFields(targetUser);
      setFormData(initialData);
      setInitialDataState(initialData);
    }

    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [targetUser]);

  const hasChanges = useMemo(() => {
    if (!targetUser || !initialDataState.name) return false;

    const formChanged = !isEqual(
      pickEditableFields(formData),
      pickEditableFields(initialDataState),
    );
    const avatarChanged = avatarFile !== null || (!avatarPreview && targetUser.avatar);

    return formChanged || avatarChanged;
  }, [formData, initialDataState, avatarFile, avatarPreview, targetUser]);

  const handleInputChange = (field: keyof IFormData, value: any) => {
    if (field === 'dateOfBirth') {
      if (!value) {
        setDateError(null);
      } else {
        const d = dayjs(value, 'YYYY-MM-DD', true);
        if (!d.isValid()) {
          setDateError('Ngày sinh không hợp lệ');
        } else if (d.isAfter(dayjs(), 'day')) {
          setDateError('Ngày sinh không được ở tương lai');
        } else {
          const age = dayjs().diff(d, 'year');
          if (age < 16) {
            setDateError('Người dùng phải từ 16 tuổi trở lên');
          } else {
            setDateError(null);
          }
        }
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    const newMajorOptions = getMajorOptionsForRole(value);

    setFormData(prev => ({
      ...prev,
      role: value,
      major: newMajorOptions.length === 1 ? newMajorOptions[0].value : prev.major,
    }));
  };

  const handleSave = () => {
    if (!targetUser?.id) return;
    if (dateError) {
      message.error(dateError);
      return;
    }
    if (formData.dateOfBirth && !dayjs(formData.dateOfBirth, 'YYYY-MM-DD', true).isValid()) {
      message.error('Ngày sinh không hợp lệ');
      return;
    }

    const changedFields = Object.entries(pickEditableFields(formData)).filter(
      ([key, value]) => value !== initialDataState[key as keyof IFormData],
    );

    const formDataToSend = new FormData();
    changedFields.forEach(([key, value]) => {
      if (key === 'dateOfBirth' && value) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, value as any);
      }
    });

    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    if (!avatarPreview && targetUser.avatar) {
      formDataToSend.append('removeAvatar', 'true');
    }

    updateUser(
      {
        url: `users/${targetUser.id}`,
        method: 'patch',
        values: formDataToSend,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật người dùng thành công');
          setAvatarFile(null);
          setInitialDataState(pickEditableFields(formData));
          refetch();

          invalidate({
            resource: 'users',
            invalidates: ['list', 'detail'],
          });

          if (isEditingSelf) {
            invalidate({
              resource: 'auth',
              invalidates: ['all'],
            });
          }
        },
        onError: (error: any) => {
          const details = error?.response?.data?.details;
          if (details && Array.isArray(details)) {
            details.forEach((d: any) => {
              message.error(`${d.field}: ${d.message}`);
            });
          } else if (error?.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error('Có lỗi xảy ra khi cập nhật người dùng');
          }
        },
      },
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Xác nhận hủy thay đổi',
        content: 'Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn hủy không?',
        okText: 'Đồng ý',
        cancelText: 'Tiếp tục chỉnh sửa',
        okButtonProps: { danger: true },
        onOk: () => {
          if (targetUser) {
            const initialAvatar = targetUser.avatar || undefined;
            if (
              avatarPreview &&
              avatarPreview.startsWith('blob:') &&
              initialAvatar !== avatarPreview
            ) {
              URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(initialAvatar);
            setAvatarFile(null);
            setFormData(initialDataState);
          }
        },
      });
    } else {
      navigate(-1);
    }
  };

  const readOnlyFieldStyle: React.CSSProperties = {
    height: '32px',
    lineHeight: '30px',
  };

  if (isLoading || !targetUser) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!canManageTarget && !isEditingSelf) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Bạn không có quyền chỉnh sửa người dùng này.</p>
        <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <Space
      direction="vertical"
      size={isMobile ? 12 : 24}
      style={{
        display: 'flex',
        width: '100%',
        padding: 12,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        marginTop: 30,
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Card
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 17, paddingLeft: 6, fontWeight: 600 }}>
              {isEditingSelf ? 'Thông tin cá nhân' : 'Chỉnh sửa người dùng'}
            </Text>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="small"
                onClick={handleCancel}
                disabled={isUpdating}
                style={{ borderRadius: 8 }}
              >
                {hasChanges ? (
                  'Hủy'
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {' '}
                    <IconArrowBackUp size={14} /> Quay lại
                  </span>
                )}
              </Button>
              {hasChanges && (
                <Button
                  type="primary"
                  size="small"
                  onClick={handleSave}
                  loading={isUpdating}
                  style={{
                    borderRadius: 8,
                    opacity: isUpdating ? 0.8 : 1,
                  }}
                  icon={
                    isUpdating ? <Spinner size={16} color="#fff" /> : <IconDeviceFloppy size={16} />
                  }
                >
                  Lưu
                </Button>
              )}
            </div>
          </div>
        }
        size="small"
        style={{
          width: '100%',
          flex: 4,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
        styles={{
          header: {
            padding: '12px 16px',
            minHeight: 44.8,
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
          },
          body: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 20 : 32,
            padding: isMobile ? 16 : 32,
          },
        }}
      >
        <div
          style={{
            flex: isMobile ? 'none' : 1,
            minWidth: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 15,
            borderRight: isMobile ? 'none' : '1px solid #eee',
            paddingRight: isMobile ? 0 : 20,
          }}
        >
          <div
            style={{
              position: 'relative',
              background: '#f9f9f9',
              padding: 12,
              borderRadius: 12,
              border: '1px solid #eee',
            }}
          >
            <CustomAvatar
              size={130}
              name={formData.name || 'User'}
              src={avatarPreview}
              style={{
                transition: 'opacity 0.3s',
                fontSize: 48,
                fontWeight: 600,
                background: getColorFromName(formData.name),
                border: 'none',
              }}
            />
            {avatarPreview && (
              <Tooltip title="Xóa ảnh đại diện">
                <Button
                  type="text"
                  size="small"
                  icon={<IconX size={14} color="#333" />}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    borderRadius: 8,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(undefined);
                  }}
                />
              </Tooltip>
            )}
          </div>

          <Upload
            showUploadList={false}
            accept="image/*"
            beforeUpload={file => {
              if (!file.type.startsWith('image/')) {
                message.error('Chỉ chấp nhận file ảnh!');
                return false;
              }
              if (file.size / 1024 / 1024 > 5) {
                message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
                return false;
              }
              setAvatarFile(file);
              setAvatarPreview(URL.createObjectURL(file));
              return false;
            }}
          >
            <Button
              icon={<IconUpload size={14} />}
              style={{
                borderRadius: 8,
                padding: '4px 12px',
                gap: 6,
              }}
            >
              Thay đổi ảnh
            </Button>
          </Upload>
        </div>

        <div style={{ flex: 3, minWidth: 300, paddingTop: isMobile ? 0 : 10 }}>
          <Row gutter={[20, 16]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Họ và tên</label>
              </div>
              <Input
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Mã giảng viên</label>
              </div>
              <Input
                value={formData.username}
                onChange={e => handleInputChange('username', e.target.value)}
                placeholder="Nhập mã giảng viên"
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Email</label>
              </div>
              <Input value={formData.email} disabled style={readOnlyFieldStyle} />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Số điện thoại</label>
              </div>
              <Input
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <label style={{ fontWeight: 500 }}>Vai trò</label>
                {!canEditRole && (
                  <Tooltip
                    title={
                      isEditingSelf
                        ? 'Bạn không thể thay đổi vai trò của chính mình'
                        : 'Bạn không có quyền thay đổi vai trò của người dùng này'
                    }
                  >
                    <IconInfoHexagon size={14} color="#838383" />
                  </Tooltip>
                )}
              </div>
              <Select
                value={formData.role}
                onChange={handleRoleChange}
                disabled={!canEditRole}
                placeholder="Chọn vai trò"
                style={{ width: '100%' }}
                options={availableRoles}
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <label style={{ fontWeight: 500 }}>Trạng thái</label>
                {!canEditStatus && (
                  <Tooltip
                    title={
                      isEditingSelf
                        ? 'Bạn không thể thay đổi trạng thái của chính mình'
                        : 'Bạn không có quyền thay đổi trạng thái của người dùng này'
                    }
                  >
                    <IconInfoHexagon size={14} color="#838383" />
                  </Tooltip>
                )}
              </div>
              <Select
                value={formData.isActive}
                onChange={value => handleInputChange('isActive', value)}
                disabled={!canEditStatus}
                placeholder="Chọn trạng thái"
                style={{ width: '100%' }}
                options={userStatusFilterOptions}
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <label style={{ fontWeight: 500 }}>Chuyên ngành</label>
                {!canEditMajor && (
                  <Tooltip title="Bạn không có quyền thay đổi chuyên ngành của người dùng này">
                    <IconInfoHexagon size={14} color="#838383" />
                  </Tooltip>
                )}
              </div>
              <Select
                value={formData.major || undefined}
                onChange={value => handleInputChange('major', value)}
                placeholder="Chọn chuyên ngành"
                style={{ width: '100%' }}
                options={majorOptions}
                disabled={!canEditMajor}
                showSearch
                filterOption={(input, option: any) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Ngày sinh</label>
              </div>
              <>
                <DatePicker
                  value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                  onChange={date =>
                    handleInputChange('dateOfBirth', date ? date.format('YYYY-MM-DD') : '')
                  }
                  disabledDate={current => !!current && current > dayjs().endOf('day')}
                  placeholder="Chọn ngày sinh"
                  style={{ width: '100%' }}
                  format={'DD/MM/YYYY'}
                />
                {dateError && (
                  <div style={{ marginTop: 6 }}>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {dateError}
                    </Text>
                  </div>
                )}
              </>
            </Col>
          </Row>
        </div>
      </Card>

      <Card
        size="small"
        style={{
          flex: 1,
          minWidth: isMobile ? '100%' : 250,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
        styles={{
          header: {
            padding: '12px 16px',
            minHeight: 44.8,
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
          },
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: isMobile ? 16 : 24,
          },
        }}
        title={
          <Text style={{ fontSize: 17, paddingLeft: 6, fontWeight: 600 }}>Thông tin tài khoản</Text>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 500, color: '#555' }}>Cập nhật gần nhất:</span>
          <span style={{ fontSize: 14, color: '#222' }}>
            {targetUser?.updatedAt
              ? dayjs(targetUser.updatedAt).format('DD/MM/YYYY HH:mm:ss')
              : 'N/A'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 500, color: '#555' }}>Ngày tạo:</span>
          <span style={{ fontSize: 14, color: '#222' }}>
            {targetUser?.createdAt
              ? dayjs(targetUser.createdAt).format('DD/MM/YYYY HH:mm:ss')
              : 'N/A'}
          </span>
        </div>
      </Card>
    </Space>
  );
};
