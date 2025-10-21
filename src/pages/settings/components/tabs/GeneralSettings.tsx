import { UserRole } from '@/common/enum/user';
import { IUser } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { getUserRoleLabel } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import { getUserStatusLabel } from '@/utils';
import { getColorFromName } from '@/utils/activity';
import { getMajorOptionsForRole } from '@/utils/majorGroups';
import { useCustomMutation, useInvalidate, useOne } from '@refinedev/core';
import { IconDeviceFloppy, IconInfoHexagon, IconUpload, IconX } from '@tabler/icons-react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
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
import { useMediaQuery } from 'usehooks-ts';

const { Text } = Typography;
interface IFormData {
  name: string;
  phone: string;
  username: string;
  major: string;
  dateOfBirth: string;
}

const pickEditableFields = (obj: any): IFormData => ({
  name: obj.name || '',
  phone: obj.phone || '',
  username: obj.username || '',
  major: obj.major || '',
  dateOfBirth: obj.dateOfBirth || '',
});

const GeneralSettings = () => {
  const [dateError, setDateError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user: authUser } = useAuth();
  const invalidate = useInvalidate();

  const {
    data: userDetail,
    isLoading,
    refetch,
  } = useOne<IUser>({
    resource: 'users',
    id: authUser?.id || '',
    queryOptions: {
      enabled: !!authUser?.id,
    },
  });

  const identity = userDetail?.data || authUser;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [formData, setFormData] = useState<IFormData>({
    name: '',
    phone: '',
    username: '',
    major: '',
    dateOfBirth: '',
  });
  const [initialDataState, setInitialDataState] = useState<IFormData>({
    name: '',
    phone: '',
    username: '',
    major: '',
    dateOfBirth: '',
  });

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
    if (!identity || !initialDataState.name) return false;

    const formChanged = !isEqual(
      pickEditableFields(formData),
      pickEditableFields(initialDataState),
    );

    const avatarChanged = avatarFile !== null || (!avatarPreview && identity.avatar);

    return formChanged || avatarChanged;
  }, [formData, initialDataState, avatarFile, avatarPreview, identity]);

  const handleInputChange = (field: keyof IFormData, value: string) => {
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
          if (age < 18) {
            setDateError('Người dùng phải từ 18 tuổi trở lên');
          } else {
            setDateError(null);
          }
        }
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!identity?.id) return;
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
      formDataToSend.append(key, value as any);
    });

    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    if (!avatarPreview && identity.avatar) {
      formDataToSend.append('removeAvatar', 'true');
    }

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
        },
      },
    );
  };

  const handleCancel = () => {
    if (identity) {
      const initialAvatar = identity.avatar || undefined;
      if (avatarPreview && avatarPreview.startsWith('blob:') && initialAvatar !== avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(initialAvatar);
      setAvatarFile(null);

      setFormData(initialDataState);
    }
  };

  const readOnlyFieldStyle: React.CSSProperties = {
    height: '32px',
    lineHeight: '30px',
  };

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner size={28} />
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
            <Text style={{ fontSize: 17, paddingLeft: 6, fontWeight: 600 }}>Thông tin cá nhân</Text>
            <Button
              style={{
                visibility: 'hidden',
              }}
            />
            {hasChanges && (
              <>
                <Space
                  style={{
                    display: 'flex',
                  }}
                >
                  <Button
                    type="text"
                    style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      gap: 6,
                      border: '1px solid #f1f1f1',
                    }}
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={
                      isUpdating ? (
                        <Spinner size={16} color="#fff" />
                      ) : (
                        <IconDeviceFloppy size={16} />
                      )
                    }
                    onClick={handleSave}
                    styles={{
                      icon: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      gap: 6,
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  >
                    Lưu
                  </Button>
                </Space>
              </>
            )}
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
            padding: 8,
            maxHeight: 48,
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
              name={identity?.name || 'User'}
              src={avatarPreview}
              style={{
                transition: 'opacity 0.3s',
                fontSize: 48,
                fontWeight: 600,
                background: getColorFromName(identity?.name || 'User'),
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
                <label style={{ fontWeight: 500 }}>Chuyên ngành</label>
              </div>
              <Select
                value={formData.major || undefined}
                onChange={value => handleInputChange('major', value)}
                placeholder="Chọn chuyên ngành"
                style={{ width: '100%' }}
                options={majorOptions}
                showSearch
                filterOption={(input, option: any) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>Email</label>
              </div>
              <Input value={identity?.email || 'N/A'} disabled style={readOnlyFieldStyle} />
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <label style={{ fontWeight: 500 }}>Chức vụ</label>
                <Tooltip title="Bạn không thể tự thay đổi chức vụ của mình">
                  <IconInfoHexagon size={14} color="#838383" />
                </Tooltip>
              </div>
              <Input
                value={getUserRoleLabel(identity?.role as UserRole) || 'N/A'}
                disabled
                style={readOnlyFieldStyle}
              />
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
                <label style={{ fontWeight: 500 }}>Ngày sinh</label>
              </div>
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
            </Col>

            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <label style={{ fontWeight: 500 }}>Trạng thái</label>
                <Tooltip title="Bạn không thể tự thay đổi trạng thái hoạt động của mình">
                  <IconInfoHexagon size={14} color="#838383" />
                </Tooltip>
              </div>
              <Input
                value={getUserStatusLabel(identity?.isActive) || 'N/A'}
                disabled
                style={readOnlyFieldStyle}
              />
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
            height: 48,
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
            {identity?.updatedAt ? dayjs(identity.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
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
            {identity?.createdAt ? dayjs(identity.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </span>
        </div>
      </Card>
    </Space>
  );
};

export default GeneralSettings;
