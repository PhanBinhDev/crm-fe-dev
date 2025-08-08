import { FC, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import type { IUser } from '@/common/types';
import { userStatusFilterOptions, userRoleFilterOptions } from '@/constants/user';

interface UserFormProps {
  initialValues?: IUser;
  onFinish: (values: any) => void;
  isEdit?: boolean;
  isSelfEdit?: boolean;
}

export const UserForm: FC<UserFormProps> = ({
  initialValues,
  onFinish,
  isEdit = false,
  isSelfEdit = false,
}) => {
  const [form] = Form.useForm();

  // Transform initialValues để đảm bảo boolean values được hiển thị đúng
  const transformedInitialValues = initialValues
    ? {
        ...initialValues,
        isActive: initialValues.isActive ?? true, // Default to true if undefined
      }
    : undefined;

  // Set form values khi initialValues thay đổi
  useEffect(() => {
    if (transformedInitialValues) {
      form.setFieldsValue(transformedInitialValues);
    }
  }, [form, transformedInitialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={transformedInitialValues}
      onFinish={onFinish}
      key={initialValues?.id} // Re-render khi user ID thay đổi
    >
      <Form.Item
        name="email"
        label={
          <span>
            Email
            {isEdit && (
              <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                (Không thể thay đổi)
              </span>
            )}
          </span>
        }
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      >
        <Input placeholder="Nhập email" disabled={isEdit} />
      </Form.Item>

      <Form.Item
        name="name"
        label="Họ và tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
      >
        <Input placeholder="Nhập họ và tên" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại' },
          { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
        ]}
      >
        <Input placeholder="Nhập số điện thoại" />
      </Form.Item>

      <Form.Item
        name="role"
        label={
          <span>
            Vai trò
            {isSelfEdit && (
              <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                (Không thể tự thay đổi)
              </span>
            )}
          </span>
        }
        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
      >
        <Select
          options={userRoleFilterOptions}
          disabled={isSelfEdit} // Không cho tự update vai trò
          placeholder="Chọn vai trò"
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label={
          <span>
            Trạng thái
            {isSelfEdit && (
              <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                (Không thể tự thay đổi)
              </span>
            )}
          </span>
        }
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      >
        <Select
          options={userStatusFilterOptions}
          disabled={isSelfEdit} // Không cho tự update trạng thái
          placeholder="Chọn trạng thái"
        />
      </Form.Item>
    </Form>
  );
};
