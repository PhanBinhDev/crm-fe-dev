import { IActivity } from '@/common/types';
import { Space, Typography } from 'antd';
import { useState } from 'react';

interface ActivityChecklistProps {
  activity: IActivity;
}

const ActivityChecklist = ({ activity }: ActivityChecklistProps) => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
            Danh sách việc
          </Typography.Text>
        </div>
      </div>

      {isCreating ? (
        <>Create UI</>
      ) : activity?.checklists ? (
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
