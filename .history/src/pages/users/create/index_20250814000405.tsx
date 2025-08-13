import { Card, Button, Form } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { useNavigate } from 'react-router-dom';

export const UserCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.submit();
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title="Tạo người dùng mới"
        extra={
          <Button onClick={() => navigate('/users')}>
            Quay lại
          </Button>
        }
        styles={{ body: { padding: '32px 24px' } }}
      >
        <UserForm 
          form={form}
          isEdit={false} 
          isSelfEdit={false}
        />
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleSubmit}
          >
            Tạo người dùng
            }}
          >
            Tạo người dùng
          </Button>
        </div>
      </Card>
    </div>
  );
};
