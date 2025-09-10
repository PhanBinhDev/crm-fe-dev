import { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useTable } from '@refinedev/antd';
import { useCan } from '@refinedev/core';
import { IconChevronDown, IconDownload, IconPlus, IconUpload } from '@tabler/icons-react';
import { Button, Dropdown, Space } from 'antd';
import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalExportUser } from './ModalExportUser';
import { ImportModal } from './ImportModal';
import { UserRole } from '@/common/enum/user';

export const UserActions: FC = () => {
  const navigate = useNavigate();
  const { user: identity } = useAuth();
  const { data: canCreate } = useCan({
    resource: 'users',
    action: 'create',
    params: { identity },
  });
  const [openExport, setOpenExport] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const { tableQueryResult } = useTable<IUser>({
    resource: 'users/all',
    pagination: { pageSize: 1000 },
  });
  const users = tableQueryResult?.data?.data || [];

  if (!canCreate?.can) {
    return null;
  }

  const handleImportSuccess = () => {
    setOpenImport(false);
    // Refresh the table data
    tableQueryResult?.refetch();
  };

  const menuItems = [
    {
      key: 'import',
      icon: <IconUpload size={16} color="#0072bc" />,
      label: 'Import',
      onClick: () => setOpenImport(true),
    },
    {
      key: 'export',
      icon: <IconDownload size={16} color="#ff8000" />,
      label: 'Export',
      onClick: () => setOpenExport(true),
    },
  ];

  return (
    <>
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
      <ModalExportUser open={openExport} onClose={() => setOpenExport(false)} users={users} />
      <ImportModal 
        visible={openImport} 
        onClose={() => setOpenImport(false)} 
        onSuccess={handleImportSuccess} 
      />
    </>
  );
};

export const UserActionDropdown: FC<{ user: IUser }> = ({ user }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const canEdit = useMemo(() => currentUser?.role === UserRole.CNBM || currentUser?.id === user.id, [currentUser, user]);
  
  const actionItems = useMemo(() => {
    const items = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        onClick: () => console.log(`Xem chi tiết user ${user.id}`),
      },
    ];

    if (canEdit) {
      items.push(
        {
          key: 'edit',
          label: 'Chỉnh sửa',
          onClick: () => navigate(`/teachers/${user.id}`),
        },
        {
          key: 'disable',
          label: user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
          onClick: () => console.log(`${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} user ${user.id}`),
        }
      );
    }
    
    return items;
  }, [canEdit, user, navigate]);

  return (
    <Dropdown
      menu={{ items: actionItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button type="default">...</Button>
    </Dropdown>
  );
};