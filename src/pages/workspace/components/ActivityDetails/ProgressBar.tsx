import { IActivity } from '@/common/types';
import { getProgressColor, getProgressText } from '@/utils/colors';
import { IconChevronDown } from '@tabler/icons-react';
import { Button, Card, Progress, Typography } from 'antd';

interface ProgressBarProps {
  activity: IActivity;
}

const ProgressBar = ({ activity }: ProgressBarProps) => {
  return (
    <Card
      styles={{
        body: {
          padding: '8px',
          paddingBottom: 4,
          borderRadius: 10,
          boxShadow: 'none',
          width: '100%',
        },
      }}
      style={{
        boxShadow: 'none',
        border: '1px solid #f0f0f0',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Tiến độ hoàn thành
        </Typography.Title>

        <Button
          type="text"
          size="small"
          style={{
            alignSelf: 'flex-start',
            padding: '0 6px',
            borderRadius: 6,
            gap: 4,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconChevronDown size={14} color="#838383" />}
        />
      </div>

      <Typography.Text type="secondary" style={{ fontSize: 13, marginBottom: 4, display: 'block' }}>
        {getProgressText(activity.progress || 0)}
      </Typography.Text>

      <div style={{ marginTop: 'auto' }}>
        <Progress
          percent={activity.progress || 0}
          strokeColor={getProgressColor(activity.progress || 0)}
          strokeWidth={8}
          style={{ borderRadius: 8, height: 'fit-content' }}
        />
      </div>
    </Card>
  );
};

export default ProgressBar;
