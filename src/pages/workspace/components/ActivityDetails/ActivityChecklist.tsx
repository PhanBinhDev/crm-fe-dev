import { Checklist, IActivity } from '@/common/types';
import { Progress, Space, Typography } from 'antd';
import { useState } from 'react';

interface ActivityChecklistProps {
  activity: IActivity;
}

const ActivityChecklist = ({ activity }: ActivityChecklistProps) => {
  const checklists = activity.checklists || [];
  const doneCount = checklists.filter((c: Checklist) => c.items.every(item => item.isDone)).length;
  const totalCount = checklists.reduce((sum, c) => sum + c.items.length, 0);
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const [isCreating] = useState(false);

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
            Danh sách việc:
          </Typography.Text>
        </div>
        {checklists.length > 0 && (
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
              marginTop: '4px',
            }}
          />
        )}
      </div>

      {activity?.checklists ? (
        <>Create UI</>
      ) : isCreating ? (
        <>No checklist item</>
      ) : (
        activity?.checklists?.map(item => (
          <div key={item.name}>
            <Typography.Text>{item.name}</Typography.Text>
          </div>
        ))
      )}
    </Space>
  );
};

export default ActivityChecklist;
