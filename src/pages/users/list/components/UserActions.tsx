import { FC, useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { IconPlus, IconUpload, IconDownload, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useCan } from '@refinedev/core';
import { useAuth } from '@/hooks/useAuth';

export const UserActions: FC = () => {
  const navigate = useNavigate();
  const { user: identity } = useAuth();

  const { data: canCreate } = useCan({
    resource: 'users',
    action: 'create',
    params: { identity },
  });

  if (!canCreate?.can) {
    return null;
  }

  const menuItems = [
    {
      key: 'import',
      icon: <IconUpload size={16} color="#0072bc" />,
      label: 'Import',
      onClick: () => navigate('/teachers/import'),
    },
    {
      key: 'export',
      icon: <IconDownload size={16} color="#ff8000" />,
      label: 'Export',
      onClick: () => navigate('/teachers/export'),
    },
  ];

  return (
    <Space>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
        <Button
          type="default"
          icon={<IconChevronDown size={16} />}
          style={{ borderRadius: 8, fontWeight: 500 }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          Import/Export
        </Button>
      </Dropdown>
      <Button
        type="primary"
        icon={<IconPlus size={18} />}
        onClick={() => navigate('/teachers/create')}
        style={{ borderRadius: 8, fontWeight: 500 }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      />
    </Space>
  );
};
