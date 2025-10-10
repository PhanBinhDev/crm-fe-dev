import { ActivityType } from '@/common/enum/activity';
import { IconCalendarTime, IconCheck, IconCircleDashed } from '@tabler/icons-react';
import { Button, Space, Typography } from 'antd';

interface ActivityTypeContentProps {
  selectedType: ActivityType | null;
  onActivityTypeClick: (type: ActivityType) => void;
}

const ActivityTypeContent = ({ selectedType, onActivityTypeClick }: ActivityTypeContentProps) => {
  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
        gap: 0,
      }}
    >
      <Typography
        style={{
          padding: '3px 12px 0',
          fontWeight: 600,
        }}
      >
        Loại hoạt động
      </Typography>

      <Space
        direction="vertical"
        style={{
          gap: 4,
          width: '100%',
          padding: 8,
        }}
        styles={{
          item: {
            width: '100%',
          },
        }}
      >
        <Button
          type="text"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '0 6px',
          }}
          onClick={() => {
            onActivityTypeClick(ActivityType.TASK);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {<IconCircleDashed size={14} />}
            Công việc
          </div>

          {selectedType === ActivityType.TASK && (
            <IconCheck size={14} color="#838383" style={{ marginLeft: 'auto', display: 'block' }} />
          )}
        </Button>

        <Button
          type="text"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '0 6px',
          }}
          onClick={() => {
            onActivityTypeClick(ActivityType.EVENT);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCalendarTime size={14} />
            Sự kiện
          </div>

          {selectedType === ActivityType.EVENT && (
            <IconCheck size={14} color="#838383" style={{ marginLeft: 'auto', display: 'block' }} />
          )}
        </Button>
      </Space>
    </Space>
  );
};

export default ActivityTypeContent;
