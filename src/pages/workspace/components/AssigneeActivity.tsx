import { IUser } from '@/common/types';
import { useList } from '@refinedev/core';
import { IconCheck, IconSearch, IconUsers } from '@tabler/icons-react';
import { Avatar, Button, Input, List, Popover, Space, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface AssigneeActivityProps {
  children?: React.ReactNode;
  selectedUser: IUser[];
  onToggleSelectUser: (user: IUser) => void;
}

const MAX_DISPLAY_COUNT = 3;

const AssigneeActivity = ({
  children,
  selectedUser,
  onToggleSelectUser,
}: AssigneeActivityProps) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search, 400);

  const { data, isLoading } = useList<IUser>({
    resource: 'users/all',
    filters: debouncedSearch
      ? [
          {
            field: 'q',
            operator: 'contains',
            value: debouncedSearch,
          },
        ]
      : [],
    pagination: { pageSize: 20 },
    queryOptions: {
      retry: false,
      enabled: !!debouncedSearch,
    },
  });

  const users = useMemo(() => {
    if (isLoading) return [];
    return data?.data ?? [];
  }, [isLoading, data]);

  return (
    <Popover
      // After open then focus on input
      afterOpenChange={open => {
        if (open) {
          setTimeout(() => {
            document.getElementById('assignee-search-input')?.focus();
          }, 0);
        }
      }}
      content={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            <Input
              placeholder="Tìm kiếm hoặc nhập email..."
              size="small"
              variant="borderless"
              id="assignee-search-input"
              value={search}
              prefix={
                <IconSearch
                  size={12}
                  style={{
                    marginRight: 4,
                  }}
                  color="#838383"
                />
              }
              onChange={e => setSearch(e.target.value)}
              styles={{
                prefix: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            />
          </div>
          <List
            dataSource={users}
            loading={!!debouncedSearch && isLoading}
            style={{ minHeight: 180, overflowY: 'auto', margin: '0 8px' }}
            renderItem={(user: IUser) => {
              const isActive = selectedUser.some(u => u.id === user.id);
              return (
                <List.Item
                  key={user.id}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: '#f6f6f6',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    border: isActive ? '1px solid #1890ff' : '1px solid transparent',
                  }}
                  onClick={() => onToggleSelectUser(user)}
                  className="assignee-list-item"
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f0f0f0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f6f6f6';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Avatar
                      size={24}
                      src={user.avatar}
                      style={{ background: '#1890ff', fontSize: 14 }}
                    >
                      {user.name?.[0] ?? 'U'}
                    </Avatar>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        color: isActive ? '#1890ff' : undefined,
                      }}
                    >
                      {user.name}
                    </span>
                  </div>
                  <Space
                    styles={{
                      item: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                  >
                    <div
                      className="assignee-profile-btn"
                      style={{ opacity: 0, transition: 'opacity 0.2s' }}
                    >
                      <Tooltip title="Xem hồ sơ">
                        <button
                          style={{
                            width: 'auto',
                            padding: '0 10px',
                            fontSize: 12,
                            lineHeight: '24px',
                            borderRadius: 6,
                            border: '1px solid #d9d9d9',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            height: 24,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                          }}
                        >
                          Hồ sơ
                        </button>
                      </Tooltip>
                    </div>
                    {/* Icon checked when isActive */}
                    {isActive && <IconCheck size={16} color="#1890ff" />}
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>
      }
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      destroyOnHidden
      styles={{
        body: {
          width: 280,
          padding: 0,
        },
      }}
    >
      {children ?? (
        <>
          {selectedUser && selectedUser.length > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                height: 24,
                padding: '0 3px 0 4px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {selectedUser.slice(0, MAX_DISPLAY_COUNT).map(user => (
                <Tooltip title={user.name} key={user.id}>
                  <Avatar
                    size={18}
                    src={user.avatar}
                    style={{
                      background: '#7c3aed',

                      border: '1px solid #fff',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {user.name?.[0] ?? 'U'}
                    </span>
                  </Avatar>
                </Tooltip>
              ))}
              {selectedUser.length > MAX_DISPLAY_COUNT && (
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 12,
                    background: '#e0e7ff',
                    borderRadius: 4,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: selectedUser.length > 10 ? 30 : 22,
                  }}
                >
                  +{selectedUser.length - MAX_DISPLAY_COUNT}
                </span>
              )}
            </div>
          ) : (
            <Button
              size="small"
              style={{
                borderRadius: 6,
                gap: 4,
                color: '#838383',
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              icon={<IconUsers size={12} />}
            >
              Phụ trách
            </Button>
          )}
        </>
      )}
    </Popover>
  );
};

export default AssigneeActivity;
