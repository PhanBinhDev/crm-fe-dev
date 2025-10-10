import { IAssignee } from '@/common/types/assignee';
import AssigneeContent from '@/components/shared/AssigneeContent';
import { IconBell } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'antd';

interface NotificationActivityBtnProps {
  currentAssignees: IAssignee[];
  onChangeAssignees: (assignees: IAssignee[]) => void;
}

const NotificationActivityBtn = ({
  currentAssignees,
  onChangeAssignees,
}: NotificationActivityBtnProps) => {
  return (
    <Popover
      trigger={['click']}
      placement="topRight"
      arrow={false}
      content={
        <AssigneeContent
          currentAssignees={currentAssignees}
          onChangeAssignees={onChangeAssignees}
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
          <span style={{ fontSize: 12, color: '#838383' }}>{currentAssignees.length}</span>
        </Button>
      </Tooltip>
    </Popover>
  );
};

export default NotificationActivityBtn;
