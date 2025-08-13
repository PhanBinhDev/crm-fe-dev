import { useState, useEffect } from 'react';
import { Edit, useForm, RefreshButton } from '@refinedev/antd';
import { Card, Button, message, Spin, Form } from 'antd'; // Import Form
import { UserForm } from '@/pages/users/form/components/UserForm';
import { IUser } from '@/common/types';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/api/user';

export const UserEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IUser>();
  const { user: identity } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [form] = Form.useForm(); // Khởi tạo form instance

  const isSelfEdit = identity?.id === id;

  // Fetch user data if not provided by formProps
  useEffect(() => {
    const fetchUserData = async () => {
      if (id && !formProps.initialValues) {
        try {
          const response = await UserService.getUser(id);
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          message.error('Không thể tải thông tin người dùng');
        }
      }
    };

    fetchUserData();
  }, [id, formProps.initialValues]);

  if (queryResult?.isLoading || (!formProps.initialValues && !userData)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const initialValues = formProps.initialValues || userData;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Edit
        saveButtonProps={{
          ...saveButtonProps,
          children: 'Lưu',
        }}
        title="Chỉnh sửa người dùng"
        breadcrumb={false}
        headerButtons={({ refreshButtonProps }) => (
          <>
            <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
            <Button onClick={() => navigate('/users')}>
              Quay lại
            </Button>
          </>
        )}
      >
        <Card styles={{ body: { padding: '32px 24px' } }}>
          <UserForm
            form={form} // Truyền form instance xuống UserForm
            initialValues={initialValues as IUser}
            isEdit={true}
            isSelfEdit={isSelfEdit}
            loading={loading}
          />
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button 
              type="primary" 
              size="large"
              loading={loading}
              onClick={() => form.submit()} // Gọi form.submit()
            >
                  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) {
                    submitButton.click();
                  }
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      </Edit>
    </div>
  );
};
