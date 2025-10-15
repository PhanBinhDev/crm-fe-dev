import { UserRole } from '@/common/enum/user';
import { IFileUploadResponse, IUser } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { getUserRoleLabel, getUserStatusLabel } from '@/utils';
import { getMajorOptionsForRole } from '@/utils/majorGroups';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { useCustomMutation, useInvalidate, useOne, useUpdate } from '@refinedev/core';
import { IconInfoHexagon } from '@tabler/icons-react';
import {
  Avatar,
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
} from 'antd';
import dayjs from 'dayjs';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useMemo, useState } from 'react';

const { Text } = Typography;

type EditableFields = Pick<IUser, 'name' | 'phone' | 'username' | 'dateOfBirth' | 'major'>;

const GeneralSettings = () => {
  const { user: authUser } = useAuth();
  const invalidate = useInvalidate();

  const { data: userDetail, isLoading } = useOne<IUser>({
    resource: 'users',
    id: authUser?.id || '',
    queryOptions: {
      enabled: !!authUser?.id,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PLACEHOLDER);

  const { mutate: uploadFile } = useCustomMutation<IFileUploadResponse>();
  const { mutate: updateUser } = useUpdate<IUser>();

  const identity = userDetail?.data || authUser;

  const majorOptions = useMemo(() => {
    if (!identity?.role) return [];
    return getMajorOptionsForRole(identity.role);
  }, [identity?.role]);

  useMemo(() => {
    if (identity?.avatar) {
      setAvatarUrl(identity.avatar);
    }
  }, [identity?.avatar]);

  const handleFieldUpdate = (field: keyof EditableFields, value: string) => {
    const oldValue = (identity as IUser)?.[field] || '';

    if (value === oldValue) {
      return;
    }

    const updatedValues = { [field]: value };

    setIsSaving(true);

    updateUser(
      {
        resource: 'users',
        id: identity?.id,
        values: updatedValues,
        mutationMode: 'optimistic',
      },
      {
        onSuccess: () => {
          invalidate({
            resource: 'users',
            invalidates: ['detail'],
            id: identity?.id,
          });

          invalidate({
            resource: 'auth',
            invalidates: ['detail'],
          });
        },
        onSettled: () => {
          setIsSaving(false);
        },
      },
    );
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
              id: identity?.id,
              values: { avatar: fullUrl },
              mutationMode: 'optimistic',
            },
            {
              onSuccess: () => {
                setAvatarUrl(fullUrl);
                onSuccess?.(res.data, file as any);
                invalidate({
                  resource: 'auth',
                  invalidates: ['detail'],
                });
                invalidate({
                  resource: 'users',
                  invalidates: ['detail'],
                  id: identity?.id,
                });
              },
              onError: error => {
                onError?.(error as any);
              },
              onSettled: () => {
                setUploading(false);
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

  const readOnlyFieldStyle: React.CSSProperties = {
    fontSize: '14px',
    height: '32px',
    lineHeight: '32px',
    display: 'block',
    padding: '0 11px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
  };

  if (isLoading && !identity) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spinner />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', height: '100%' }}>
      <Card
        title={
          <Space>
            <Text style={{ fontSize: 20 }}>Thông tin cá nhân</Text>
            {isSaving && <Spinner />}
          </Space>
        }
        bordered={false}
        style={{ height: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 24,
            paddingRight: 8,
            height: '100%',
          }}
        >
          <div
            style={{
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <Avatar
              size={130}
              icon={<UserOutlined />}
              src={avatarUrl !== AVATAR_PLACEHOLDER ? avatarUrl : undefined}
              style={{ backgroundColor: '#667EEA' }}
              onError={() => {
                handleAvatarError();
                return false;
              }}
            />
            {uploading && <Spinner />}
            <Upload
              showUploadList={false}
              accept=".jpg,.jpeg,.png"
              disabled={uploading}
              customRequest={handleAvatarUpload}
            >
              <Button
                icon={<CameraOutlined />}
                type="text"
                style={{ border: '1px solid #d8d8d8ff' }}
              >
                Thay đổi
              </Button>
            </Upload>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Họ và tên</label>
                </div>
                <Input
                  value={identity?.name || ''}
                  onChange={e => handleFieldUpdate('name', e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Chuyên ngành</label>
                </div>
                <Select
                  value={identity?.major || undefined}
                  onChange={value => handleFieldUpdate('major', value)}
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
                <div style={readOnlyFieldStyle}>{identity?.email || 'N/A'}</div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <label style={{ fontWeight: 500 }}>Chức vụ</label>
                  <Tooltip title="Bạn không thể tự thay đổi chức vụ của mình">
                    <IconInfoHexagon size={14} color="#838383" />
                  </Tooltip>
                </div>
                <div style={readOnlyFieldStyle}>
                  {getUserRoleLabel(identity?.role as UserRole) || 'N/A'}
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Số điện thoại</label>
                </div>
                <Input
                  value={identity?.phone || ''}
                  onChange={e => handleFieldUpdate('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Mã giảng viên</label>
                </div>
                <Input
                  value={identity?.username || ''}
                  onChange={e => handleFieldUpdate('username', e.target.value)}
                  placeholder="Nhập mã giảng viên"
                />
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Ngày sinh</label>
                </div>
                <DatePicker
                  value={identity?.dateOfBirth ? dayjs(identity.dateOfBirth) : null}
                  onChange={date =>
                    handleFieldUpdate('dateOfBirth', date ? date.format('YYYY-MM-DD') : '')
                  }
                  placeholder="Chọn ngày sinh"
                  style={{ width: '100%' }}
                  format={'DD/MM/YYYY'}
                />
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <label style={{ fontWeight: 500 }}>Trạng thái</label>
                  <Tooltip title="Bạn không thể tự thay đổi trạng thái hoạt động của mình">
                    <IconInfoHexagon size={14} color="#838383" />
                  </Tooltip>
                </div>
                <div style={readOnlyFieldStyle}>
                  {getUserStatusLabel(identity?.isActive) || 'N/A'}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
    </Space>
  );
};

export default GeneralSettings;
