import { IMember } from '@/common/types';
import { IAssignee } from '@/common/types/assignee';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { IconCheck, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { Avatar, Button, Input, List, Skeleton } from 'antd';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface AssigneeContentProps {
  currentAssignees: IAssignee[];
  onChangeAssignees: (assignees: IAssignee[]) => void;
}

const AssigneeContent = ({ currentAssignees, onChangeAssignees }: AssigneeContentProps) => {
  const { user } = useAuth();

  const { currentWorkspace } = useWorkspaces();
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounceValue(search, 500);

  const { data: users, isLoading: isLoadingUsers } = useList<IMember>({
    resource: `workspaces/${currentWorkspace?.id}/members`,
    queryOptions: {
      enabled: !!currentWorkspace?.id,
    },
    filters: searchValue
      ? [
          {
            field: 'q',
            operator: 'eq',
            value: searchValue,
          },
        ]
      : [],
  });

  return (
    <div
      style={{
        width: '248px',
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
        style={{
          marginTop: 8,
          overflowY: 'auto',
          gap: 4,
          padding: '0 8px',
        }}
      >
        {isLoadingUsers ? (
          <>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                <Skeleton.Avatar active size="small" style={{ marginRight: 8 }} />
                <Skeleton.Input active size="small" style={{ width: 198 }} />
              </div>
            ))}
          </>
        ) : users?.data?.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '16px 12px',
              fontSize: 13,
              borderRadius: 6,
              background: '#f5f5f5',
            }}
          >
            Không tìm thấy thành viên nào
          </div>
        ) : (
          <>
            {users?.data?.map(item => {
              const isSelected = currentAssignees.some(
                assignee => assignee?.user?.id === item?.user?.id,
              );

              return (
                <List.Item
                  key={item.id}
                  onClick={() => {
                    if (isSelected) {
                      onChangeAssignees(
                        currentAssignees.filter(assignee => assignee?.user?.id !== item.user.id),
                      );
                    } else {
                      if (!currentAssignees.some(assignee => assignee?.user?.id === item.user.id)) {
                        onChangeAssignees([
                          ...currentAssignees,
                          { user: item.user, userId: item.user.id } as IAssignee,
                        ]);
                      }
                    }
                  }}
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
                    <Avatar
                      size="small"
                      src={item.user.avatar}
                      style={{
                        backgroundColor: '#7b69ee',
                        color: '#fff',
                      }}
                    >
                      {item.user.name?.[0].toUpperCase()}
                    </Avatar>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {user?.id === item.user.id
                        ? `${item.user.name.charAt(0).toUpperCase() + item.user.name.slice(1)} (Bạn)`
                        : item.user.name.charAt(0).toUpperCase() + item.user.name.slice(1)}
                    </span>
                  </div>
                  {isSelected && <IconCheck size={16} color="#888" />}
                </List.Item>
              );
            })}
          </>
        )}
      </List>
      <div style={{ padding: 8 }}>
        <Button
          type="text"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            height: 30,
            padding: '0 8px',
          }}
          icon={<IconUserPlus size={14} />}
        >
          Mời thành viên
        </Button>
      </div>
    </div>
  );
};

export default AssigneeContent;
