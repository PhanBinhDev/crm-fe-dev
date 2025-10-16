import { Result } from 'antd';
import React from 'react';
import Spinner from '../ui/Spinner';

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Đang tải...',
  subtitle = 'Vui lòng đợi trong giây lát',
}) => {
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
        icon={<Spinner size={48} />}
        title={<span style={{ color: '#fff', fontSize: '24px' }}>{title}</span>}
        subTitle={<span style={{ color: '#fff', opacity: 0.8 }}>{subtitle}</span>}
      />
    </div>
  );
};
