import { useTable } from '@refinedev/antd';
import { Card, Row, Col } from 'antd';
import { UserFilters, UserTable, UserActions } from './components';
import { useState, useMemo, useCallback } from 'react';
import type { IUser } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { useInvalidate } from '@refinedev/core';

export const UserList = () => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    role?: UserRole;
    isActive?: boolean;
  }>({
    role: undefined,
    isActive: undefined,
  });

  const invalidate = useInvalidate();

  const dynamicFilters = useMemo(() => {
    const filterList: Array<{ field: string; operator: 'contains' | 'eq'; value: any }> = [];

    if (searchText) {
      filterList.push({ field: 'q', operator: 'contains', value: searchText });
    }

    if (filters.role !== undefined) {
      filterList.push({ field: 'role', operator: 'eq', value: filters.role });
    }

    if (filters.isActive !== undefined) {
      filterList.push({ field: 'isActive', operator: 'eq', value: filters.isActive });
    }

    return filterList;
  }, [searchText, filters.role, filters.isActive]);

  const { tableProps } = useTable<IUser>({
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
    errorNotification: false,
    queryOptions: {
      retry: false,
    },
  });

  const handleReset = () => {
    setSearchText('');
    setFilters({ role: undefined, isActive: undefined });
  };

  // Callback to refresh user list after CRUD operations
  const handleUserUpdated = useCallback(() => {
    invalidate({
      resource: 'users/all',
      invalidates: ['list'],
    });
  }, [invalidate]);

  return (
    <Card>
      <Row gutter={[0, 16]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <UserFilters
            searchValue={searchText}
            roleValue={filters.role}
            statusValue={filters.isActive}
            onSearch={setSearchText}
            onRoleFilter={value => setFilters(prev => ({ ...prev, role: value }))}
            onStatusFilter={value => setFilters(prev => ({ ...prev, isActive: value }))}
            onReset={handleReset}
          />
          <UserActions />
        </Col>
        <Col span={24}>
          <UserTable 
            tableProps={tableProps} 
            onPageSizeChange={setPageSize}
            onUserUpdated={handleUserUpdated}
          />
        </Col>
      </Row>
    </Card>
  );
};
