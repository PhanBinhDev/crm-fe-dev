import { IActivity } from '@/common/types';
import { getProgressColor, getProgressText } from '@/utils/colors';
import { useOne } from '@refinedev/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Button, Card, Progress, Typography } from 'antd';
import { memo, useRef } from 'react';

interface ProgressBarProps {
  activity: IActivity;
}

const ProgressBar = ({ activity }: ProgressBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: progressData } = useOne({
    resource: `activities/${activity.id}/progress`,
    id: '',
    queryOptions: {
      enabled: !!activity.id,
      retry: false,
      queryKey: ['activity-progress', activity.id],
    },
  });

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
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
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

        <Typography.Text
          type="secondary"
          style={{ fontSize: 13, marginBottom: 4, display: 'block' }}
        >
          {getProgressText(progressData?.data?.progress || 0)}
        </Typography.Text>

        <div style={{ marginTop: 'auto' }}>
          <Progress
            percent={progressData?.data?.progress || 0}
            strokeColor={getProgressColor(progressData?.data?.progress || 0)}
            strokeWidth={8}
            style={{ borderRadius: 8, height: 'fit-content' }}
          />
        </div>
      </div>
    </Card>
  );
};

export default memo(ProgressBar);
