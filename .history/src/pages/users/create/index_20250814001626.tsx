import { Card, Button } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { useNavigate } from 'react-router-dom';

export const UserCreate = () => {
  const navigate = useNavigate();

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
          isEdit={false} 
          isSelfEdit={false}
        />
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                if (submitButton) {
                  submitButton.click();
                }
              }
            }}
          >
            Tạo người dùng
          </Button>
        </div>
      </Card>
    </div>
  );
};
