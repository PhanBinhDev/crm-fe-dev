import { FC } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCan, useGetIdentity } from '@refinedev/core';

export const UserActions: FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity();

  const { data: canCreate } = useCan({
    resource: 'users',
    action: 'create',
    params: { identity },
  });

  if (!canCreate?.can) {
    return null;
  }

  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/create')}>
      Thêm người dùng
    </Button>
  );
};
