import React, { useState, useMemo, useEffect } from 'react';
import { useTable } from '@refinedev/antd';
import { Card, Row, Col } from 'antd';
import { UserFilters, UserTable, UserActions } from './components';
import type { IUser } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

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
    queryOptions: {
      retry: false,
    },
  });

  const handleReset = () => {
    setSearchText('');
    setFilters({ role: undefined, isActive: undefined });
  };

  useEffect(() => {
    if (location.state?.reload && tableQueryResult?.refetch) {
      tableQueryResult.refetch();
    }
    // eslint-disable-next-line
  }, [location.state, tableQueryResult]);

  return (
    <Card>
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
            <UserActions />
          </div>
        </Col>
        <Col span={24}>
          <UserTable tableProps={tableProps} onPageSizeChange={setPageSize} />
        </Col>
      </Row>
    </Card>
  );
};
