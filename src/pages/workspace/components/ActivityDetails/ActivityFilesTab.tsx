import { IconPlus } from '@tabler/icons-react';
import { Button, Typography } from 'antd';
import ActivityFilesList from './ActivityFilesList';

const { Title } = Typography;

interface ActivityFilesTabProps {
  activityId: string;
}

const ActivityFilesTab = ({ activityId }: ActivityFilesTabProps) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 8px 8px 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          minHeight: 49,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Tệp đính kèm
        </Title>

        <Button
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          style={{
            borderRadius: 8,
          }}
          type="text"
          icon={<IconPlus size={16} stroke={1.5} color="#646464" />}
        />
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%', padding: 8 }}>
        <ActivityFilesList files={[]} loading={false} />
      </div>
    </div>
  );
};

export default ActivityFilesTab;
