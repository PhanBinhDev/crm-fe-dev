import { UserForm } from '@/pages/users/form/components/UserForm';
import { useCustomMutation } from '@refinedev/core';
import { Form, message, Spin } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserCreate = () => {
  const [form] = Form.useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate: createUser } = useCustomMutation();
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    if (isProcessing) return;

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
      await new Promise((resolve, reject) => {
        createUser(
          {
            url: '/users',
            method: 'post',
            values: payload,
          },
          {
            onSuccess: res => resolve(res),
            onError: error => reject(error),
          },
        );
      });
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
    <div>
      {isProcessing && <Spin style={{ display: 'block', margin: '20px auto' }} />}
      <UserForm onFinish={handleFinish} />
    </div>
  );
};
