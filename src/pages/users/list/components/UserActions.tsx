import { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useList } from '@refinedev/core';
import { useCan } from '@refinedev/core';
import { IconChevronDown, IconDownload, IconPlus, IconUpload } from '@tabler/icons-react';
import { Button, Dropdown, Space } from 'antd';
import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalExportUser } from './ModalExportUser';
import { ImportModal } from './ImportModal';
import { UserRole } from '@/common/enum/user';

interface UserActionsProps {
  totalUsers: number;
  currentPageUsers: IUser[];
}

export const UserActions: FC<UserActionsProps> = ({ totalUsers, currentPageUsers }) => {
  const navigate = useNavigate();
  const { user: identity } = useAuth();
  const { data: canCreate } = useCan({
    resource: 'users',
    action: 'create',
    params: { identity },
  });
  const [openExport, setOpenExport] = useState(false);
  const [openImport, setOpenImport] = useState(false);


  const { data: allUsersData, refetch: refetchAllUsers } = useList<IUser>({
    resource: 'users/all',
    pagination: {
      pageSize: totalUsers || 9999, 
    },
    queryOptions: {
      enabled: false, 
    },
  });

  const allUsers = allUsersData?.data || [];

  if (!canCreate?.can) {
    return null;
  }

  const handleImportSuccess = () => {
    setOpenImport(false);
  };

  const handleOpenExport = () => {
    setOpenExport(true);
    refetchAllUsers();
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
      onClick: handleOpenExport,
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
      <ModalExportUser 
        open={openExport} 
        onClose={() => setOpenExport(false)} 
        users={allUsers.length > 0 ? allUsers : currentPageUsers} 
        totalUser={totalUsers} 
      />
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