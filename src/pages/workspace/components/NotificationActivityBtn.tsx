import AssigneeContent from '@/components/shared/AssigneeContent';
import { useList } from '@refinedev/core';
import { IconBell } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

interface NotificationActivityBtnProps {
  workspaceId: string;
}

const NotificationActivityBtn = ({ workspaceId }: NotificationActivityBtnProps) => {
  const { data } = useList({
    resource: `workspaces/${workspaceId}/members`,
    pagination: { mode: 'off' },
    queryOptions: { enabled: !!workspaceId },
  });
  const members = useMemo(() => {
    return data?.data?.map((m: any) => m.user) || [];
  }, [data]);

  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Popover
      trigger={['click']}
      placement="topRight"
      arrow={false}
      content={
        <AssigneeContent
          currentAssignees={members.filter(m => selected.includes(m.id))}
          onChangeAssignees={users => setSelected(users.map(u => u.id))}
        />
      }
      styles={{
        body: { padding: 0 },
      }}
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
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <span style={{ fontSize: 12, color: '#838383' }}>{selected.length}</span>
        </Button>
      </Tooltip>
    </Popover>
  );
};

export default NotificationActivityBtn;
