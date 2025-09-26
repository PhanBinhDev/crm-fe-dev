import { useList } from '@refinedev/core';
import { IconPointFilled } from '@tabler/icons-react';
import { List, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

interface ActivityFeedbacksProps {
  activityId: string;
}

const ActivityFeedbacks = ({ activityId }: ActivityFeedbacksProps) => {
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
        style={{ width: '100%', padding: '30px', textAlign: 'center', fontSize: 13, color: '#999' }}
      >
        <span> Chưa có đánh giá</span>
      </div>
    );
  }

  const visibleItems = dataLogs.data.slice(0, 5);
  const otherItems = dataLogs.data.slice(5);

  const buildLogMessage = (item: any) => {
    switch (item.metadata?.type) {
      case 'STAGE_CHANGE':
        return `Chuyển hoạt động từ ${item.metadata.oldStageId} sang ${item.metadata.newStageId}`;
      default:
        return item.message;
    }
  };

  return (
    <div>
      <List
        size="small"
        bordered={false}
        dataSource={showAll ? dataLogs.data : visibleItems}
        renderItem={item => (
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
                    <span style={{ fontWeight: 500 }}>{item.user?.name}:</span>{' '}
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
        )}
      />
      {otherItems.length > 0 && (
        <div
          onClick={() => setShowAll(!showAll)}
          style={{
            textAlign: 'center',
            marginTop: 8,
            fontSize: 12,
            padding: '5px 3px',
            margin: '0 14px',
            borderRadius: 5,
            cursor: 'pointer',
            color: '#666666ff',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#e3e3e3ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f7f7f7ff';
          }}
        >
          <span>{showAll ? 'Ẩn bớt' : `Xem thêm ${otherItems.length} hoạt động`}</span>
        </div>
      )}
    </div>
  );
};

export default ActivityFeedbacks;
