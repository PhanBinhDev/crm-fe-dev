'use client';

import { type FC, useEffect, useState, useMemo } from 'react';
import { message as antdMessage, Spin } from 'antd';
import {
  Form,
  Input,
  Select,
  Upload,
  Avatar,
  Row,
  Col,
  DatePicker,
  Button,
} from 'antd';
import { IconUpload, IconUser } from '@tabler/icons-react';
import type { UploadProps, UploadFile } from 'antd';
import type { IUser } from '@/common/types';
import { userStatusFilterOptions, userRoleFilterOptions } from '@/constants/user';
import dayjs from 'dayjs';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/common/enum/user';

interface UserFormProps {
  initialValues?: IUser;
  onFinish: (values: any) => void;
  isEdit?: boolean;
}

export const UserForm: FC<UserFormProps> = ({
  initialValues,
  onFinish,
  isEdit = false,
}) => {
  const { user: identity } = useAuth();
  const isCNBM = identity?.role === UserRole.CNBM;
  const isEditViewOnly = isEdit && !isCNBM;
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    try {
      await onFinish(values);
    } finally {
      setIsProcessing(false);
    }
  };

  const canEdit = useMemo(() => {
    if (identity?.role === 'CNBM') {
      return true;
    }
    return isEdit ? identity?.id === initialValues?.id : false;
  }, [identity, initialValues, isEdit]);

  if (!canEdit) {
    return <div>Bạn không có quyền chỉnh sửa người dùng này.</div>;
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={120}
                src={avatarUrl}
                icon={<IconUser size={64} />}
                style={{ border: '4px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
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
                  {uploading ? <Spin /> : 'Tải ảnh lên'}
                </Button>
              </Upload>
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
            <Input placeholder="Nhập họ và tên" style={{ borderRadius: 8 }} disabled={isEditViewOnly} />
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
            <Input placeholder="Nhập tên đăng nhập" style={{ borderRadius: 8 }} disabled={isEditViewOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" disabled={isEditViewOnly} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
          >
            <Input placeholder="Nhập số điện thoại" style={{ borderRadius: 8 }} disabled={isEditViewOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item name="major" label="Chuyên ngành">
            <Input placeholder="Nhập chuyên ngành" style={{ borderRadius: 8 }} disabled={isEditViewOnly} />
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
              disabled={isEditViewOnly}
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
          >
            <Select
              options={userRoleFilterOptions}
              disabled={isEditViewOnly}
              placeholder="Chọn vai trò"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="isActive"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              options={userStatusFilterOptions}
              disabled={isEditViewOnly}
              placeholder="Chọn trạng thái"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
        <Button type="primary" htmlType="submit" disabled={isProcessing}>
          {isProcessing ? <Spin /> : 'Lưu'}
        </Button>
      </Form.Item>
    </Form>
  );
};