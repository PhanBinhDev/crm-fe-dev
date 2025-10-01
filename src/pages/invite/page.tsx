import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCustomMutation } from '@refinedev/core';
import { Button, Card, Result, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const InviteWorkspace = () => {
  const params = useParams();
  const token = params.token;
  const navigate = useNavigate();

  const {
    mutate,
    isPending: isVerifying,
    isError,
    isSuccess,
  } = useCustomMutation({
    mutationOptions: {
      retry: false,
    },
  });

  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (token) {
      mutate({
        method: 'post',
        url: `workspaces/invite/${token}`,
        values: {},
      });
    }
  }, []);

  useEffect(() => {
    if (isError || !token) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isError, token, navigate]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        styles={{
          body: { padding: '48px 32px 32px' },
        }}
      >
        {isVerifying && (
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <div>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />} />
            </div>
            <div>
              <Title level={3} style={{ marginBottom: 8 }}>
                Đang xác thực lời mời
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Vui lòng chờ trong giây lát...
              </Text>
            </div>
          </Space>
        )}

        {isSuccess && (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title={
              <Title level={3} style={{ marginTop: 16 }}>
                Tham gia thành công!
              </Title>
            }
            subTitle="Bạn đã được thêm vào workspace. Đang chuyển hướng..."
          />
        )}

        {(isError || !token) && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Result
              status="error"
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 56 }} />}
              title={
                <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                  Lời mời không hợp lệ
                </Title>
              }
              subTitle={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 15 }}>
                    Liên kết này đã hết hạn hoặc không tồn tại
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Tự động chuyển về trang chủ sau{' '}
                    <Text strong style={{ color: '#ff4d4f' }}>
                      {countdown}s
                    </Text>
                  </Text>
                </Space>
              }
              extra={
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate('/')}
                    block
                    style={{
                      height: 44,
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    Về trang chủ ngay
                  </Button>
                </Space>
              }
              style={{ padding: 0 }}
            />
          </Space>
        )}
      </Card>
    </div>
  );
};

export default InviteWorkspace;
