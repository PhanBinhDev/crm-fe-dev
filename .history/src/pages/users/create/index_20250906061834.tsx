
// import { Create, useForm } from '@refinedev/antd';

import { Card, Form, message } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/api/user';
import { UserRole } from '@/common/enum/user';
import { useState } from 'react';

export const UserCreate = () => {
  const { user: identity } = useAuth();
  const [form] = Form.useForm();
  const [isProcessing, setIsProcessing] = useState(false);

  // Component cha cần xác định vai trò của người dùng hiện tại
  const isCNBM = identity?.role === UserRole.CNBM;

  // Đây là hàm xử lý dữ liệu sau khi form được gửi thành công
  const handleFinish = async (values: any) => {
    if (isProcessing) return;
    if (!isCNBM) {
      message.error('Bạn không có quyền tạo người dùng mới!');
      return;
    }
    setIsProcessing(true);
    const payload = {
      name: values.name,
      username: values.username,
      email: values.email,
      phone: values.phone,
      major: values.major,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
      role: values.role,
      isActive: values.isActive === true || values.isActive === 'true',
      avatar: values.avatar,
    };
    try {
      await UserService.createUser(payload);
      message.success('Tạo người dùng thành công!');
      form.resetFields();
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach((d: any) => {
          message.error(`${d.field}: ${d.message}`);
        });
      } else if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Tạo người dùng thất bại!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      title="Thêm người dùng mới"
      style={{ maxWidth: 800, margin: '0 auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      {/* Truyền hàm xử lý và form instance vào component UserForm */}
      <UserForm
        onFinish={handleFinish}
        isEdit={false}
        isSelfEdit={false}
        formProps={{ form }}
      />
    </Card>
  );
};
