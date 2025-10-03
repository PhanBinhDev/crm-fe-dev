import { useOne } from '@refinedev/core';
import { Typography } from 'antd';
import ActivityFilesList from './ActivityFilesList';

const { Title } = Typography;

interface ActivityFilesTabProps {
  activityId: string;
}

const ActivityFilesTab = ({ activityId }: ActivityFilesTabProps) => {
  const { data: activityData, isLoading } = useOne({
    resource: 'activities',
    id: activityId,
  });

  const files = activityData?.data?.files || [];

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
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Tệp đính kèm ({files.length})
        </Title>
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%' }}>
        <ActivityFilesList files={files} loading={isLoading} />
      </div>
    </div>
  );
};

export default ActivityFilesTab;
