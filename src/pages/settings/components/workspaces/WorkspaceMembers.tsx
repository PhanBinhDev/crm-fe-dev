import { MemberStatus } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { MemberRolesFilter } from '@/constants/workspaces';
import { useTable } from '@refinedev/antd';
import { CrudFilter } from '@refinedev/core';
import { IconCheck, IconSearch } from '@tabler/icons-react';
import { Button, Input, Popover, Space } from 'antd';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';
import { MemberTable } from './MemberTable';

interface FilterMembers {
  role: 'all' | 'owner' | 'admin' | 'member';
  tab: 'active' | 'invited';
}

const WorkspaceMembers = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [search, setSearch] = useState('');
  const [debounced] = useDebounceValue(search, 300);

  const [filters, setFilters] = useState<FilterMembers>({
    role: 'all',
    tab: 'active',
  });

  const permanentFilters = useMemo(() => {
    return [
      {
        field: 'role',
        operator: 'eq',
        value: filters.role !== 'all' ? filters.role : undefined,
      },
      {
        field: 'status',
        operator: 'eq',
        value: filters.tab === 'active' ? MemberStatus.ACTIVE : MemberStatus.PENDING,
      },
      {
        field: 'q',
        operator: 'eq',
        value: debounced || undefined,
      },
    ];
  }, [filters.role, filters.tab, debounced]);

  const { setPageSize, tableProps, current, tableQuery } = useTable<IMember>({
    resource: `workspaces/${workspaceId}/members`,
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!workspaceId,
      retry: false,
    },
    filters: {
      permanent: permanentFilters as CrudFilter[],
    },
  });

  const tablePropSort = useMemo(() => {
    if (!tableProps?.dataSource) return [];

    return [...tableProps.dataSource].sort((a, b) => {
      if (a.role === 'owner') return -1;
      if (b.role === 'owner') return 1;
      return 0;
    });
  }, [tableProps?.dataSource]);

  if (tableProps) {
    tableProps.dataSource = tablePropSort;
  }

  const tabList = useMemo(() => {
    if (tableQuery.isLoading || !tableQuery.data) {
      return [
        { key: 'active', label: 'Hoạt động', count: 0 },
        { key: 'invited', label: 'Đã mời', count: 0 },
      ];
    }

    const activeCount = tableQuery.data.metadata.totalActive;

    const invitedCount = tableQuery.data.metadata.totalPending;

    return [
      { key: 'active', label: 'Hoạt động', count: activeCount },
      { key: 'invited', label: 'Đã mời', count: invitedCount },
    ];
  }, [tableQuery.data, tableQuery.isLoading]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              background: '#f7f8fa',
              borderRadius: 8,
              padding: 4,
              gap: 0,
              height: 34,
            }}
          >
            {tabList.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilters({ ...filters, tab: tab.key as FilterMembers['tab'] })}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontWeight: 500,
                  fontSize: 14,
                  color: filters.tab === tab.key ? '#222' : '#666',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {tab.label}
                <span
                  style={{
                    marginLeft: 8,
                    color: '#333',
                    background: '#e0e0e0',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    borderRight: 12,
                  }}
                >
                  {tab.count}
                </span>
                {filters.tab === tab.key && (
                  <motion.div
                    layoutId="tab-bg"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 6,
                      background: '#ededed',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                  />
                )}
              </button>
            ))}
          </div>

          <Input
            placeholder="Tìm kiếm thành viên..."
            variant="borderless"
            style={{ width: 200, borderRadius: 8, border: '1px solid #d9d9d9' }}
            prefix={<IconSearch size={14} color="#838383" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Popover
            placement="bottomLeft"
            trigger={['click']}
            arrow={false}
            styles={{
              body: {
                padding: 8,
                width: 160,
                borderRadius: 10,
              },
            }}
            content={
              <Space
                styles={{
                  item: {
                    width: '100%',
                  },
                }}
                style={{
                  width: '100%',
                  gap: 4,
                }}
                direction="vertical"
              >
                {MemberRolesFilter.map(role => (
                  <Button
                    size="small"
                    key={role.value}
                    type="text"
                    style={{
                      width: '100%',
                      height: 30,
                      justifyContent: 'flex-start',
                      borderRadius: 7,
                    }}
                    icon={role.icon}
                    styles={{
                      icon: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    }}
                    onClick={() =>
                      setFilters({ ...filters, role: role.value as FilterMembers['role'] })
                    }
                  >
                    {role.label}

                    {role.value === filters.role && (
                      <IconCheck
                        size={14}
                        color="#838383"
                        style={{
                          marginLeft: 'auto',
                        }}
                      />
                    )}
                  </Button>
                ))}
              </Space>
            }
          >
            <Button
              type="text"
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid #d9d9d9',
                gap: 4,
                justifyContent: 'flex-start',
                color: '#333',
              }}
              icon={MemberRolesFilter.find(role => role.value === filters.role)?.icon}
              styles={{
                icon: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              }}
            >
              {MemberRolesFilter.find(role => role.value === filters.role)?.label}
            </Button>
          </Popover>
        </div>
      </div>
      <MemberTable tableProps={tableProps} onPageSizeChange={setPageSize} />
    </div>
  );
};

export default WorkspaceMembers;
