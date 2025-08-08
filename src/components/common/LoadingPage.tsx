import React from 'react';
import { Spin, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Đang tải...',
  subtitle = 'Vui lòng đợi trong giây lát',
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Result
        icon={<Spin indicator={antIcon} />}
        title={<span style={{ color: '#fff', fontSize: '24px' }}>{title}</span>}
        subTitle={<span style={{ color: '#fff', opacity: 0.8 }}>{subtitle}</span>}
      />
    </div>
  );
};
