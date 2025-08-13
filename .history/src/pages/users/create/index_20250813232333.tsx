import { Card, Button, Form } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { useNavigate } from 'react-router-dom';

export const UserCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Khởi tạo form instance

  const handleSubmit = () => {
    form.submit(); // Kích hoạt submit form
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
          form={form} // Truyền form instance xuống UserForm
          isEdit={false} 
          isSelfEdit={false}
        />
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleSubmit} // Gọi hàm handleSubmit
          >
            Tạo người dùng
          </Button>
        </div>
      </Card>
    </div>
  );
};
