import { IActivity } from '@/common/types';
import { IconPlus } from '@tabler/icons-react';
import { Button, Progress, Space, Table, Typography } from 'antd';

interface ActivitySubtaskProps {
  activity: IActivity;
}

const ActivitySubtask = ({ activity }: ActivitySubtaskProps) => {
  const subTasks = activity.subActivities || [];
  const doneCount = subTasks.filter((t: IActivity) => t.stage.isCompleted).length;
  const totalCount = subTasks.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
            Hoạt động phụ:
          </Typography.Text>

          {subTasks.length > 0 && (
            <Progress
              percent={percent}
              size={'small'}
              strokeColor={'#6ad3bc'}
              format={() => (
                <span style={{ fontSize: 12, color: '#838383' }}>
                  {doneCount}/{totalCount}
                </span>
              )}
              strokeWidth={8}
              style={{
                borderRadius: 8,
                minWidth: 80,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                marginTop: '1px',
              }}
            />
          )}
        </div>

        <Button
          type="text"
          style={{
            padding: '4px 8px',
            gap: 4,
            backgroundColor: '#1890ff',
            color: '#fff',
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconPlus size={14} />}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#40a9ff';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#1890ff';
            e.currentTarget.style.color = '#fff';
          }}
        >
          Tạo
        </Button>
      </div>

      {/*  */}
      <Table></Table>
    </Space>
  );
};

export default ActivitySubtask;
