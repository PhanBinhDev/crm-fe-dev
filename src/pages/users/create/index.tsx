import { Form, message, Spin } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/api/user';
import { UserRole } from '@/common/enum/user';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserCreate = () => {
  const { user: identity } = useAuth();
  const [form] = Form.useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const isCNBM = identity?.role === UserRole.CNBM;

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
      navigate('/teachers', { state: { reload: true } });
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {isProcessing && <Spin style={{ display: 'block', margin: '20px auto' }} />}
      <UserForm
        onFinish={handleFinish}
        isEdit={false}
      />
    </div>
  );
};
