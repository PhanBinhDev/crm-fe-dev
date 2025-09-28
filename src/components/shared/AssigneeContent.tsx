import { IMember } from '@/common/types';
import { IAssignee } from '@/common/types/assignee';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { IconCheck, IconUserPlus } from '@tabler/icons-react';
import { Avatar, Button, Input, List, Skeleton } from 'antd';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface AssigneeContentProps {
  currentAssignees: IAssignee[];
  onChangeAssignees: (assignees: IAssignee[]) => void;
}
const AssigneeContent = ({ currentAssignees, onChangeAssignees }: AssigneeContentProps) => {
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
        padding: 8,
      }}
    >
      <Input
        placeholder="Tìm kiếm hoặc nhập email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <List
        style={{
          marginTop: 8,
          maxHeight: 240,
          overflowY: 'auto',
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
                <Button
                  type="text"
                  key={item.id}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    height: 32,
                    padding: '0 8px 0 6px',
                  }}
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
                >
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
                  {item.user.name}

                  {isSelected && <IconCheck size={14} style={{ marginLeft: 'auto' }} />}
                </Button>
              );
            })}
          </>
        )}
      </List>
      <Button
        type="text"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          height: 30,
          padding: '0 8px',
          marginTop: 6,
        }}
        icon={<IconUserPlus size={14} />}
      >
        Mời thành viên
      </Button>
    </div>
  );
};

export default AssigneeContent;
