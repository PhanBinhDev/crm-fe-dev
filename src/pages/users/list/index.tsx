import { UserRole } from '@/common/enum/user';
import type { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useTable } from '@refinedev/antd';
import { useCan } from '@refinedev/core';
import { Col, Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserActions, UserFilters, UserTable } from './components';

export const UserList = () => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    role?: UserRole;
    isActive?: boolean;
  }>({});

  const location = useLocation();
  const { user: currentUser } = useAuth();

  // Kiểm tra quyền tạo user (chỉ SUPERADMIN và CNBM)
  const { data: canCreate } = useCan({
    resource: 'users',
    action: 'create',
    params: { identity: currentUser },
  });

  const dynamicFilters = useMemo(() => {
    const filterList: Array<{
      field: string;
      operator: 'contains' | 'eq';
      value: any;
    }> = [];

    const trimmedSearch = searchText.trim();
    if (trimmedSearch) {
      filterList.push({
        field: 'q',
        operator: 'contains',
        value: trimmedSearch,
      });
    }

    if (filters.role != null) {
      filterList.push({
        field: 'role',
        operator: 'eq',
        value: filters.role,
      });
    }

    if (filters.isActive != null) {
      filterList.push({
        field: 'isActive',
        operator: 'eq',
        value: filters.isActive,
      });
    }

    return filterList;
  }, [searchText, filters.role, filters.isActive]);

  const { tableProps, tableQueryResult } = useTable<IUser>({
    resource: 'users/all',
    pagination: {
      pageSize: pageSize,
    },
    filters: {
      permanent: dynamicFilters,
    },
    sorters: {
      initial: [
        {
          field: 'createdAt',
          order: 'desc',
        },
      ],
    },
    syncWithLocation: true,
  });

  const totalUsers = tableQueryResult?.data?.total ?? 0;
  const currentPageUsers = tableQueryResult?.data?.data ?? [];

  const handleReset = () => {
    setSearchText('');
    setFilters({});
  };

  useEffect(() => {
    if (location.state?.reload) {
      tableQueryResult?.refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.reload, tableQueryResult]);

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <UserFilters
              searchValue={searchText}
              roleValue={filters.role}
              statusValue={filters.isActive}
              onSearch={setSearchText}
              onRoleFilter={value => setFilters(prev => ({ ...prev, role: value }))}
              onStatusFilter={value => setFilters(prev => ({ ...prev, isActive: value }))}
              onReset={handleReset}
            />
            {/* Chỉ hiển thị nút tạo user cho SUPERADMIN và CNBM */}
            {canCreate?.can && (
              <UserActions totalUsers={totalUsers} currentPageUsers={currentPageUsers} />
            )}
          </div>
        </Col>
        <Col span={24}>
          <UserTable tableProps={tableProps} onPageSizeChange={setPageSize} />
        </Col>
      </Row>
    </div>
  );
};
