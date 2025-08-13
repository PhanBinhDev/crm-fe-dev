import { FC, useEffect } from 'react';
import { Form, Input, Select, Button, message, FormInstance } from 'antd'; // Import FormInstance
import type { IUser } from '@/common/types';
import { userStatusFilterOptions, userRoleFilterOptions } from '@/constants/user';
import { UserService } from '@/services/api/user';
import { useNavigate } from 'react-router-dom';

interface UserFormProps {
  initialValues?: IUser;
  isEdit?: boolean;
  isSelfEdit?: boolean;
  loading?: boolean;
  form: FormInstance; // Thêm form prop
}

export const UserForm: FC<UserFormProps> = ({
  initialValues,
  isEdit = false,
  isSelfEdit = false,
  loading = false,
  form, // Nhận form instance từ props
}) => {
  const navigate = useNavigate();

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

  const handleSubmit = async (values: any) => {
    try {
      // Transform data to ensure correct types and add missing fields
      const transformedValues = {
        ...values,
        username: values.username || values.email, // Use email as username if not provided
        isActive: values.isActive === 'true' || values.isActive === true,
        role: values.role,
        phone: values.phone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        avatar: values.avatar || undefined,
      };
      
      // Debug: Log data being sent
      console.log('Original form values:', values);
      console.log('Transformed values:', transformedValues);
      
      if (isEdit && initialValues?.id) {
        // Update user
        console.log('Updating user with ID:', initialValues.id);
        await UserService.updateUser(initialValues.id, transformedValues);
        message.success('Cập nhật người dùng thành công!');
      } else {
        // Create user
        console.log('Creating new user with data:', transformedValues);
        await UserService.createUser(transformedValues);
        message.success('Tạo người dùng thành công!');
      }
      
      // Navigate back to user list
      navigate('/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      console.error('Error response:', error?.response?.data);
      
      // Log detailed error information
      if (error?.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
        console.error('Error details count:', error.response.data.details.length);
        
        // Show specific validation errors with detailed content
        const details = error.response.data.details;
        if (Array.isArray(details)) {
          details.forEach((detail: any, index: number) => {
            console.error(`Error ${index + 1}:`, detail);
            console.error(`Error ${index + 1} content:`, JSON.stringify(detail, null, 2));
            
            // Log specific error fields if available
            if (detail.field) {
              console.error(`Error ${index + 1} field:`, detail.field);
            }
            if (detail.message) {
              console.error(`Error ${index + 1} message:`, detail.message);
            }
            if (detail.value) {
              console.error(`Error ${index + 1} value:`, detail.value);
            }
            if (detail.constraints) {
              console.error(`Error ${index + 1} constraints:`, detail.constraints);
            }
          });
        }
      }
      
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={transformedInitialValues}
      onFinish={handleSubmit}
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
        name="username"
        label="Tên đăng nhập"
        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        tooltip="Tên đăng nhập để truy cập hệ thống"
      >
        <Input placeholder="Nhập tên đăng nhập" />
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

      {/* Hidden submit button for form validation */}
      <Form.Item style={{ display: 'none' }}>
        <Button htmlType="submit" loading={loading} />
      </Form.Item>
    </Form>
  );
};
