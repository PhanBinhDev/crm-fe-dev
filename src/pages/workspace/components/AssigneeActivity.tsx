import { IMember, IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { IconCheck, IconSearch, IconUsers } from '@tabler/icons-react';
import { Avatar, Button, Input, List, Popover, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface AssigneeActivityProps {
  children?: React.ReactNode;
  selectedUser: IUser[];
  title?: string;
  onToggleSelectUser: (user: IUser) => void;
}

const MAX_DISPLAY_COUNT = 3;

const AssigneeActivity = ({
  children,
  selectedUser,
  onToggleSelectUser,
  title = 'Phụ trách',
}: AssigneeActivityProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search, 400);

  const { data, isLoading } = useList<IMember>({
    resource: workspaceId ? `workspaces/${workspaceId}/members` : '',
    filters: debouncedSearch
      ? [
          {
            field: 'q',
            operator: 'contains',
            value: debouncedSearch,
          },
        ]
      : [],
    pagination: { mode: 'off' },
    queryOptions: {
      retry: false,
      enabled: !!workspaceId,
    },
  });

  const members = useMemo(() => {
    if (isLoading) return [];
    return data?.data ?? [];
  }, [isLoading, data]);

  return (
    <Popover
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
            dataSource={members}
            loading={isLoading}
            style={{
              minHeight: 180,
              maxHeight: 200,
              overflowY: 'auto',
              margin: '0 8px',
            }}
            renderItem={(item: IMember) => {
              const member = item.user;
              const isActive = selectedUser.some((u: IUser) => u.id === member.id);
              return (
                <List.Item
                  key={item.id}
                  onClick={() => onToggleSelectUser(member)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    border: 0,
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar size={28} src={member.avatar}>
                      {member.name?.[0]}
                    </Avatar>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {user?.id === member.id
                        ? `${member.name.charAt(0).toUpperCase() + member.name.slice(1)} (Bạn)`
                        : member.name.charAt(0).toUpperCase() + member.name.slice(1)}
                    </span>
                  </div>
                  {isActive && <IconCheck size={16} color="#888" />}
                </List.Item>
              );
            }}
          />
        </div>
      }
      trigger={['click']}
      placement="bottomLeft"
      builtinPlacements={{
        bottomLeft: {
          points: ['tl', 'bl'],
          offset: [0, 4],
          overflow: {
            adjustX: true,
            adjustY: false,
          },
        },
      }}
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
              {title}
            </Button>
          )}
        </>
      )}
    </Popover>
  );
};

export default AssigneeActivity;
