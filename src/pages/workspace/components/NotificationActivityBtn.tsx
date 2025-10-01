import { useList } from '@refinedev/core';
import { IconBell, IconCheck, IconSearch } from '@tabler/icons-react';
import { Avatar, Button, Input, List, Popover, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

interface NotificationActivityBtnProps {
  workspaceId: string;
}

const NotificationActivityBtn = ({ workspaceId }: NotificationActivityBtnProps) => {
  const { data, isLoading } = useList({
    resource: `workspaces/${workspaceId}/members`,
    pagination: { mode: 'off' },
    queryOptions: { enabled: !!workspaceId },
  });
  const members = useMemo(() => {
    return data?.data?.map((m: any) => m.user) || [];
  }, [data]);

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggleSelect = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    return members.filter(
      (u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, members]);

  return (
    <Popover
      trigger={['click']}
      placement="top"
      arrow={false}
      content={
        <div style={{ width: 260 }}>
          {/* Search */}
          <div style={{ padding: '6px 10px', borderBottom: '1px solid #eee' }}>
            <Input
              placeholder="Tìm kiếm hoặc nhập email..."
              size="small"
              variant="borderless"
              id="follower-search-input"
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

          {/* List */}
          <List
            loading={isLoading}
            dataSource={filteredMembers}
            style={{ maxHeight: 250, overflowY: 'auto' }}
            locale={{ emptyText: 'Không có thành viên' }}
            renderItem={(user: any) => {
              const isActive = selected.includes(user.id);
              return (
                <List.Item
                  key={user.id}
                  onClick={() => toggleSelect(user.id)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: 'transparent', 
                    border: '1px solid transparent', 
                    display: 'flex',
                    alignItems: 'center',
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
                    <Avatar size={28} src={user.avatar}>
                      {user.name?.[0]}
                    </Avatar>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>
                  </div>
                  {isActive && <IconCheck size={16} color="#838383" />}
                </List.Item>
              );
            }}
          />
        </div>
      }
    >
      <Tooltip title="Người theo dõi">
        <Button
          type="text"
          style={{
            width: 'fit-content',
            padding: '0 8px',
            color: '#838383',
            gap: 4,
            borderRadius: 8,
          }}
          icon={<IconBell size={16} />}
        >
          <span style={{ fontSize: 12, color: '#838383' }}>{selected.length}</span>
        </Button>
      </Tooltip>
    </Popover>
  );
};

export default NotificationActivityBtn;
