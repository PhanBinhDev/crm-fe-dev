import { UserRole } from '@/common/enum/user';
import { IFileUploadResponse, IUser } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { getUserRoleLabel } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { getUserStatusLabel } from '@/utils';
import { getColorFromName, getInitials } from '@/utils/activity';
import { getMajorOptionsForRole } from '@/utils/majorGroups';
import { CameraOutlined } from '@ant-design/icons';
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
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useEffect, useMemo, useState } from 'react';

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

  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PLACEHOLDER);

  const { mutate: uploadFile } = useCustomMutation<IFileUploadResponse>();
  const { mutate: updateUser } = useUpdate<IUser>();

  const identity = userDetail?.data || authUser;

  console.log(identity);

  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputCodeTeacher, setInputCodeTeacher] = useState('');

  useEffect(() => {
    if (identity) {
      setInputName(identity.name || '');
      setInputPhone(identity.phone || '');
      setInputCodeTeacher(identity.username || '');
    }
  }, [identity]);

  const debounceName = useDebounce(inputName, 4000);
  const debouncePhone = useDebounce(inputPhone, 4000);
  const debounceCodeTeacher = useDebounce(inputCodeTeacher, 4000);

  const majorOptions = useMemo(() => {
    if (!identity?.role) return [];
    return getMajorOptionsForRole(identity.role);
  }, [identity?.role]);

  useMemo(() => {
    if (identity?.avatar) {
      setAvatarUrl(identity.avatar);
    }
  }, [identity?.avatar]);

  useEffect(() => {
    handleFieldUpdate('name', debounceName);
  }, [debounceName]);

  useEffect(() => {
    handleFieldUpdate('phone', debouncePhone);
  }, [debouncePhone]);

  useEffect(() => {
    handleFieldUpdate('username', debounceCodeTeacher);
  }, [debounceCodeTeacher]);

  const handleFieldUpdate = (field: keyof EditableFields, value: string) => {
    const oldValue = (identity as IUser)?.[field] || '';

    if (value === oldValue) {
      return;
    }

    const updatedValues = { [field]: value };

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
            invalidates: ['all'],
          });
        },
        onSettled: () => {},
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
                  invalidates: ['all'],
                });
                invalidate({
                  resource: 'users',
                  invalidates: ['all'],
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
        variant={'borderless'}
        style={{ height: '100%', boxShadow: 'none', maxWidth: '80%', margin: '0 auto' }}
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
            <div style={{ position: 'relative' }}>
              <Avatar
                size={130}
                src={avatarUrl && avatarUrl !== AVATAR_PLACEHOLDER ? avatarUrl : undefined}
                style={{
                  backgroundColor:
                    avatarUrl && avatarUrl !== AVATAR_PLACEHOLDER
                      ? '#ffffff'
                      : getColorFromName(identity?.name),
                  color: avatarUrl && avatarUrl !== AVATAR_PLACEHOLDER ? 'transparent' : '#fff',
                  fontSize: 48,
                  fontWeight: 600,
                  opacity: uploading ? 0.4 : 1,
                  transition: 'opacity 0.3s',
                  border: 'none',
                }}
                onError={() => {
                  handleAvatarError();
                  return false;
                }}
              >
                {(!avatarUrl || avatarUrl === AVATAR_PLACEHOLDER) && getInitials(identity?.name)}
              </Avatar>

              {uploading && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Spinner />
                </div>
              )}
            </div>

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
                disabled={uploading}
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
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
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
                  value={inputPhone}
                  onChange={e => setInputPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Mã giảng viên</label>
                </div>
                <Input
                  value={inputCodeTeacher}
                  onChange={e => setInputCodeTeacher(e.target.value)}
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
