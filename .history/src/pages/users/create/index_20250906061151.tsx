
// import { Create, useForm } from '@refinedev/antd';
import { Card, Form, message } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
// import { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/api/user';
import { UserRole } from '@/common/enum/user';
import { useState } from 'react';

export const UserCreate = () => {
  const { user: identity } = useAuth();
  const [form] = Form.useForm();
  const [isProcessing, setIsProcessing] = useState(false);

 
  const isCNBM = identity?.role === UserRole.CNBM;

  // Đây là hàm xử lý dữ liệu sau khi form được gửi thành công
  const handleFinish = async (values) => {
    if (isProcessing) return;

    // Kiểm tra quyền của người dùng trước khi gọi API
    if (!isCNBM) {
      message.error('Bạn không có quyền tạo người dùng mới!');
      return;
    }

    setIsProcessing(true);

    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
    };

    try {
      await UserService.createUser(payload);
      message.success('Tạo người dùng thành công!');
      form.resetFields(); // Reset form sau khi gửi thành công
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      message.error('Tạo người dùng thất bại! Vui lòng thử lại sau.');
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


