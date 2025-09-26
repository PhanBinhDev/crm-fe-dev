import { useList } from '@refinedev/core';
import { IconChevronRight, IconPointFilled } from '@tabler/icons-react';
import { Button, List, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

interface ActivityChangedHistoryProps {
  activityId: string;
}

const ActivityChangedHistory = ({ activityId }: ActivityChangedHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  const { data: dataLogs, isLoading } = useList({
    resource: `activities/${activityId}/logs`,
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  if (isLoading) {
    return (
      <div style={{ padding: 10 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!dataLogs?.data || dataLogs.data.length === 0) {
    return (
      <div
        style={{ width: '100%', padding: '30px', textAlign: 'center', fontSize: 12, color: '#999' }}
      >
        <span> Chưa có hoạt động</span>
      </div>
    );
  }

  const allLogs = dataLogs.data;
  const latestLog = allLogs[0];
  const otherLogs = allLogs.slice(1);

  const buildLogMessage = (item: any) => {
    switch (item.metadata?.type) {
      case 'STAGE_CHANGE':
        return `Chuyển hoạt động từ ${item.metadata.oldStageId} sang ${item.metadata.newStageId}`;
      default:
        return item.message;
    }
  };

  const renderLogItem = (item: any) => (
    <List.Item
      style={{
        border: 'none',
        padding: '2px 10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          width: '100%',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          color: '#666666ff',
        }}
      >
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          <div>
            <IconPointFilled size={10} color="#666666ff" />
          </div>
          <div>
            <span style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 500, textOverflow: 'ellipsis' }}>{item.user?.name}: </span>{' '}
              {buildLogMessage(item)}
            </span>
          </div>
        </div>
        <div>
          <span
            style={{
              fontSize: 12,
              width: 'fit-content',
              whiteSpace: 'nowrap',
            }}
          >
            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      </div>
    </List.Item>
  );

  return (
    <div style={{ padding: 8, maxHeight: 'calc(90vh - 97px)', overflowY: 'auto' }}>
      {showAll && (
        <List
          style={{}}
          size="small"
          bordered={false}
          dataSource={otherLogs}
          renderItem={renderLogItem}
        />
      )}

      {otherLogs.length > 0 && (
        <Button
          type="text"
          onClick={() => setShowAll(!showAll)}
          style={{
            borderRadius: 6,
            width: '100%',
            fontSize: 12,
            color: '#666666ff',
            justifyContent: 'flex-start',
            padding: '0 7px',
          }}
          icon={
            <IconChevronRight
              size={14}
              style={{
                transform: showAll ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          }
          styles={{ icon: { display: 'flex', alignItems: 'center' } }}
        >
          {showAll ? 'Ẩn bớt' : `Xem thêm`}
        </Button>
      )}

      <List size="small" bordered={false} dataSource={[latestLog]} renderItem={renderLogItem} />
    </div>
  );
};

export default ActivityChangedHistory;
