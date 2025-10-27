'use client';

import { UserRole } from '@/common/enum/user';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { userRoleFilterOptions, userStatusFilterOptions } from '@/constants/user';
import { useAuth } from '@/hooks/useAuth';
import { getColorFromName } from '@/utils/activity';
import { getCreatableMajorOptions, getCreatableRoles } from '@/utils/majorGroups';
import { IconArrowBackUp, IconDeviceFloppy, IconUpload, IconX } from '@tabler/icons-react';
import type { UploadFile, UploadProps } from 'antd';
import {
  message as antdMessage,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'usehooks-ts';

const { Text } = Typography;

interface UserFormProps {
  onFinish: (values: any) => void;
}

export const UserForm: FC<UserFormProps> = ({ onFinish }) => {
  const { user: identity } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);

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
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      antdMessage.error('Ảnh phải nhỏ hơn 5MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleFormFinish = async (values: any) => {
    if (isProcessing) return;

    if (dateError) {
      antdMessage.error(dateError);
      return;
    }

    setIsProcessing(true);
    try {
      await onFinish(values);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = form.isFieldsTouched();
    if (hasChanges) {
      Modal.confirm({
        title: 'Xác nhận hủy',
        content: 'Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn hủy không?',
        okText: 'Đồng ý',
        cancelText: 'Tiếp tục',
        okButtonProps: { danger: true },
        onOk: () => {
          form.resetFields();
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  };

  const availableRoles = userRoleFilterOptions.filter(option =>
    getCreatableRoles(identity?.role).includes(option.value as UserRole),
  );

  const majorOptions = selectedRole
    ? getCreatableMajorOptions(identity?.role, identity?.major, selectedRole)
    : [];

  const handleRoleChange = (value: UserRole) => {
    setSelectedRole(value);
    const availableMajorOptions = getCreatableMajorOptions(identity?.role, identity?.major, value);
    if (availableMajorOptions.length === 1) {
      form.setFieldsValue({ major: availableMajorOptions[0].value });
    } else {
      form.setFieldsValue({ major: undefined });
    }
  };

  const handleDateChange = (date: any) => {
    if (!date) {
      setDateError(null);
      return;
    }
    const d = dayjs(date);
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
  };

  const currentName = Form.useWatch('name', form) || '';

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ isActive: true }}
      onFinish={handleFormFinish}
    >
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
                Tạo người dùng mới
              </Text>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="small"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  style={{ borderRadius: 8 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconArrowBackUp size={14} /> Hủy
                  </span>
                </Button>
                <Button
                  type="primary"
                  size="small"
                  htmlType="submit"
                  loading={isProcessing}
                  style={{
                    borderRadius: 8,
                    opacity: isProcessing ? 0.8 : 1,
                  }}
                  icon={
                    isProcessing ? (
                      <Spinner size={16} color="#fff" />
                    ) : (
                      <IconDeviceFloppy size={16} />
                    )
                  }
                >
                  Tạo mới
                </Button>
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
                name={currentName || 'User'}
                src={avatarUrl}
                style={{
                  transition: 'opacity 0.3s',
                  fontSize: 48,
                  fontWeight: 600,
                  background: getColorFromName(currentName),
                  border: 'none',
                }}
              />
              {avatarUrl && (
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
                    setAvatarUrl('');
                    setFileList([]);
                    form.setFieldsValue({ avatar: '' });
                  }}
                />
              )}
            </div>

            <Form.Item name="avatar" style={{ margin: 0 }}>
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
                <Button
                  icon={<IconUpload size={14} />}
                  style={{
                    borderRadius: 8,
                    padding: '4px 12px',
                    gap: 6,
                  }}
                >
                  {uploading ? <Spinner size={14} /> : 'Thay đổi ảnh'}
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div style={{ flex: 3, minWidth: 300, paddingTop: isMobile ? 0 : 10 }}>
            <Row gutter={[20, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Họ và tên <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Mã giảng viên <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã giảng viên' },
                    { min: 4, message: 'Mã giảng viên phải có ít nhất 4 ký tự' },
                    { max: 32, message: 'Mã giảng viên tối đa 32 ký tự' },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: 'Chỉ cho phép chữ, số và dấu gạch dưới',
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập mã giảng viên" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Email <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Số điện thoại <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Vai trò <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    options={availableRoles}
                    placeholder="Chọn vai trò"
                    onChange={handleRoleChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Trạng thái <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="isActive"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select options={userStatusFilterOptions} placeholder="Chọn trạng thái" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Chuyên ngành <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="major"
                  rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    options={majorOptions}
                    placeholder={selectedRole ? 'Chọn chuyên ngành' : 'Vui lòng chọn vai trò trước'}
                    disabled={!selectedRole}
                    showSearch
                    filterOption={(input, option: any) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>
                    Ngày sinh <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                </div>
                <Form.Item
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    onChange={handleDateChange}
                    disabledDate={current => !!current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
                {dateError && (
                  <div style={{ marginTop: 6 }}>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {dateError}
                    </Text>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </Card>

        {/* <Card
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
          title={<Text style={{ fontSize: 17, paddingLeft: 6, fontWeight: 600 }}>Hướng dẫn</Text>}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 14, color: '#555' }}>
              • Tất cả các trường đánh dấu <span style={{ color: '#ff4d4f' }}>*</span> là bắt buộc
            </Text>
            <Text style={{ fontSize: 14, color: '#555' }}>
              • Email sẽ được dùng để đăng nhập vào hệ thống
            </Text>
            <Text style={{ fontSize: 14, color: '#555' }}>
              • Mã giảng viên phải là duy nhất trong hệ thống
            </Text>
            <Text style={{ fontSize: 14, color: '#555' }}>
              • Ảnh đại diện tối đa 5MB, định dạng JPG/PNG
            </Text>
            <Text style={{ fontSize: 14, color: '#555' }}>
              • Người dùng phải từ 16 tuổi trở lên
            </Text>
          </div>
        </Card> */}
      </Space>
    </Form>
  );
};
