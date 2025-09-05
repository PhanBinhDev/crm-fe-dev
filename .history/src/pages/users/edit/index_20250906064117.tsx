
import { useEffect, useState } from 'react';
import { Card, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { UserService } from '@/services/api/user';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/common/enum/user';


export const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: identity } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // CNBM có thể edit bất kỳ user nào
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.getUser(id!);
        setUser(res.data);
      } catch (error) {
        message.error('Không tìm thấy người dùng!');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

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
      await UserService.updateUser(id!, payload);
      message.success('Cập nhật người dùng thành công!');
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
        message.error('Cập nhật người dùng thất bại!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <Card
      title="Chỉnh sửa người dùng"
      style={{ maxWidth: 800, margin: '0 auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      <UserForm
        onFinish={handleFinish}
        initialValues={user}
        isEdit={true}
        formProps={{}}
      />
    </Card>
  );
};
