'use client';

import { UserRole } from '@/common/enum/user';
import type { IUser } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { userRoleFilterOptions, userStatusFilterOptions } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import {
  canManageUser,
  getCreatableMajorOptions,
  getCreatableRoles,
  getEditableRoles,
  getMajorOptionsForRole,
} from '@/utils/majorGroups';
import { IconUpload, IconUser } from '@tabler/icons-react';
import type { UploadFile, UploadProps } from 'antd';
import {
  message as antdMessage,
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { type FC, useEffect, useMemo, useState } from 'react';

interface UserFormProps {
  initialValues?: IUser;
  onFinish: (values: any) => void;
  isEdit?: boolean;
}

export const UserForm: FC<UserFormProps> = ({ initialValues, onFinish, isEdit = false }) => {
  const { user: identity } = useAuth();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    initialValues?.role || undefined,
  );

  const transformedInitialValues = initialValues
    ? {
        ...initialValues,
        isActive: initialValues.isActive ?? true,
        dateOfBirth: initialValues.dateOfBirth ? dayjs(initialValues.dateOfBirth) : undefined,
      }
    : undefined;

  useEffect(() => {
    if (transformedInitialValues) {
      form.setFieldsValue(transformedInitialValues);
      setSelectedRole(transformedInitialValues.role);
      if (transformedInitialValues.avatar) {
        setAvatarUrl(transformedInitialValues.avatar);
        setFileList([
          {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: transformedInitialValues.avatar,
          },
        ]);
      }
    }
  }, [JSON.stringify(transformedInitialValues)]);

  const handleAvatarChange: UploadProps['onChange'] = info => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      const url = info.file.response?.url || URL.createObjectURL(info.file.originFileObj!);
      setAvatarUrl(url);
      form.setFieldsValue({ avatar: url });
      antdMessage.success('Tải ảnh lên thành công!');
    } else if (info.file.status === 'error') {
      antdMessage.error('Tải ảnh lên thất bại!');
    }
    setUploading(false);
  };

  const customRequest = ({ file, onSuccess }: any) => {
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      onSuccess({ url });
    }, 1000);
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      antdMessage.error('Chỉ có thể tải lên file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      antdMessage.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleFormFinish = async (values: any) => {
    if (isProcessing) return;

    if (isEdit && values.email !== initialValues?.email) {
      Modal.confirm({
        title: 'Xác nhận thay đổi email',
        content: 'Email được sử dụng để đăng nhập. Bạn có chắc chắn muốn thay đổi email không?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          setIsProcessing(true);
          try {
            await onFinish(values);
          } finally {
            setIsProcessing(false);
          }
        },
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onFinish(values);
    } finally {
      setIsProcessing(false);
    }
  };

  const isEditingSelf = useMemo(() => {
    return isEdit && identity?.id === initialValues?.id;
  }, [isEdit, identity?.id, initialValues?.id]);

  const canManageTarget = useMemo(() => {
    if (!isEdit) return true;

    return canManageUser(
      identity?.role,
      identity?.major,
      initialValues?.role,
      initialValues?.major,
      identity?.id,
      initialValues?.id,
      'edit',
    );
  }, [identity, initialValues, isEdit]);

  const availableRoles = useMemo(() => {
    if (!isEdit) {
      const creatableRoles = getCreatableRoles(identity?.role);
      return userRoleFilterOptions.filter(option =>
        creatableRoles.includes(option.value as UserRole),
      );
    }

    const editableRoles = getEditableRoles(identity?.role, initialValues?.role, isEditingSelf);

    if (editableRoles.length === 0) {
      return userRoleFilterOptions.filter(option => option.value === initialValues?.role);
    }

    return userRoleFilterOptions.filter(option => editableRoles.includes(option.value as UserRole));
  }, [identity?.role, initialValues?.role, isEdit, isEditingSelf]);

  const majorOptions = useMemo(() => {
    if (!selectedRole) return [];

    if (isEdit) {
      return getMajorOptionsForRole(selectedRole);
    }

    return getCreatableMajorOptions(identity?.role, identity?.major, selectedRole);
  }, [selectedRole, identity?.role, identity?.major, isEdit]);

  const canEditRole = useMemo(() => {
    if (!isEdit) return true;
    if (!canManageTarget) return false;

    if (isEditingSelf) return false;

    const userRole = identity?.role;
    const targetRole = initialValues?.role;

    if (userRole === UserRole.SUPERADMIN) return true;

    if (userRole === UserRole.TM) {
      if ([UserRole.SUPERADMIN, UserRole.TM].includes(targetRole as UserRole)) {
        return false;
      }
      return true;
    }

    if (userRole === UserRole.CNBM) {
      return false;
    }

    return false;
  }, [identity, initialValues, isEdit, canManageTarget, isEditingSelf]);

  const canEditStatus = useMemo(() => {
    if (!isEdit) return true;
    if (!canManageTarget) return false;

    if (isEditingSelf) return false;

    return canEditRole;
  }, [isEdit, canManageTarget, isEditingSelf, canEditRole]);

  const canEditMajor = useMemo(() => {
    if (!isEdit) return true;
    if (!canManageTarget) return false;

    const userRole = identity?.role;
    const targetRole = initialValues?.role;

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
  }, [identity, initialValues, isEdit, canManageTarget, isEditingSelf]);

  const isViewOnly = isEdit && !canManageTarget;

  const handleRoleChange = (value: UserRole) => {
    setSelectedRole(value);

    const availableMajorOptions = isEdit
      ? getMajorOptionsForRole(value)
      : getCreatableMajorOptions(identity?.role, identity?.major, value);

    if (availableMajorOptions.length === 1) {
      form.setFieldsValue({ major: availableMajorOptions[0].value });
    } else {
      form.setFieldsValue({ major: undefined });
    }
  };

  if (!canManageTarget && isEdit && identity?.id !== initialValues?.id) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Bạn không có quyền chỉnh sửa người dùng này.</p>
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={transformedInitialValues}
      onFinish={handleFormFinish}
      size="large"
    >
      <Row gutter={24}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Form.Item name="avatar" label="Ảnh đại diện">
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <Avatar
                size={120}
                src={avatarUrl}
                icon={<IconUser size={64} />}
                style={{ border: '4px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              {!isViewOnly && (
                <Upload
                  name="avatar"
                  listType="text"
                  fileList={fileList}
                  onChange={handleAvatarChange}
                  beforeUpload={beforeUpload}
                  customRequest={customRequest}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button icon={<IconUpload size={20} />} type="dashed">
                    {uploading ? <Spinner /> : 'Tải ảnh lên'}
                  </Button>
                </Upload>
              )}
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" style={{ borderRadius: 8 }} disabled={isViewOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự' },
              { max: 32, message: 'Tên đăng nhập tối đa 32 ký tự' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ cho phép chữ, số và dấu gạch dưới' },
            ]}
          >
            <Input
              placeholder="Nhập tên đăng nhập"
              style={{ borderRadius: 8 }}
              disabled={isViewOnly}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
            tooltip="Email được sử dụng để đăng nhập. Thay đổi email cần xác nhận."
          >
            <Input placeholder="Nhập email" style={{ borderRadius: 8 }} disabled={isEdit} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              style={{ borderRadius: 8 }}
              disabled={isViewOnly}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            tooltip={isEditingSelf ? 'Bạn không thể thay đổi vai trò của chính mình' : undefined}
          >
            <Select
              options={availableRoles}
              disabled={!canEditRole || isViewOnly}
              placeholder="Chọn vai trò"
              style={{ borderRadius: 8 }}
              onChange={handleRoleChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="isActive"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            tooltip={isEditingSelf ? 'Bạn không thể thay đổi trạng thái của chính mình' : undefined}
          >
            <Select
              options={userStatusFilterOptions}
              disabled={!canEditStatus || isViewOnly}
              placeholder="Chọn trạng thái"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="major"
            label="Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
          >
            <Select
              options={majorOptions}
              placeholder={selectedRole ? 'Chọn chuyên ngành' : 'Vui lòng chọn vai trò trước'}
              style={{ borderRadius: 8 }}
              disabled={!canEditMajor || isViewOnly || !selectedRole}
              showSearch
              filterOption={(input, option: any) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker
              placeholder="Chọn ngày sinh"
              style={{ width: '100%', borderRadius: 8 }}
              format="DD/MM/YYYY"
              disabled={isViewOnly}
            />
          </Form.Item>
        </Col>
      </Row>

      {!isViewOnly && (
        <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
          <Button type="primary" htmlType="submit" disabled={isProcessing}>
            {isProcessing ? <Spinner /> : 'Lưu'}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};
