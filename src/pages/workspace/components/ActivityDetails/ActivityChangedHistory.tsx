import { getActivityStatusLabel } from '@/utils';
import { useList } from '@refinedev/core';
import { IconChevronRight, IconPointFilled } from '@tabler/icons-react';
import { Button, List, Skeleton, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

interface ActivityChangedHistoryProps {
  activityId: string;
}

const ActivityChangedHistory = ({ activityId }: ActivityChangedHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useList({
    resource: `activities/${activityId}/logs`,
    sorters: [{ field: 'createdAt', order: 'desc' }],
    queryOptions: {
      enabled: !!activityId,
      retry: false,
    },
  });

  const { latestLog, otherLogs } = useMemo(() => {
    if (!data) return { latestLog: null, otherLogs: [] };

    const formattedLogs = data.map((log: any) => ({
      ...log,
      timeAgo: dayjs(log.createdAt).fromNow(),
    }));

    const [latest, ...others] = formattedLogs;

    return { latestLog: latest ?? null, otherLogs: others ?? [] };
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ padding: 10 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{ width: '100%', padding: '30px', textAlign: 'center', fontSize: 13, color: '#999' }}
      >
        <span> Chưa có hoạt động</span>
      </div>
    );
  }

  const buildLogMessage = (item: any) => {
    switch (item?.metadata?.type) {
      case 'STAGE_CHANGE':
        return `Chuyển hoạt động từ ${getActivityStatusLabel(item.metadata.oldStageName)} sang ${getActivityStatusLabel(item.metadata.newStageName)}`;
      default:
        return item?.message ?? '';
    }
  };

  const renderLogItem = (item: any) => {
    if (!item) return null;
    return (
      <List.Item
        style={{
          border: 'none',
          padding: '2px 10px',
        }}
        key={item.id ?? `${item.createdAt}`}
      >
        <div
          style={{
            display: 'flex',
            gap: 7,
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
              <span style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 500, textOverflow: 'ellipsis' }}>
                  {item.user?.name}:{' '}
                </span>{' '}
                {buildLogMessage(item)}
              </span>
            </div>
          </div>
          <div>
            <Tooltip
              title={dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
              style={{ fontSize: 13 }}
            >
              <span
                style={{
                  fontSize: 13,
                  width: 'fit-content',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.timeAgo}
              </span>
            </Tooltip>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div style={{ padding: 8, maxHeight: 'calc(90vh - 97px)', overflowY: 'auto' }}>
      {showAll && otherLogs && otherLogs.length > 0 && (
        <List
          style={{}}
          size="small"
          bordered={false}
          dataSource={otherLogs}
          renderItem={renderLogItem}
          locale={{ emptyText: 'Không có hoạt động' }}
        />
      )}

      {otherLogs.length > 0 && (
        <Button
          type="text"
          onClick={() => setShowAll(!showAll)}
          style={{
            borderRadius: 6,
            width: '100%',
            fontSize: 13,
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

      {/* only pass an array when latestLog exists */}
      <List
        size="small"
        bordered={false}
        dataSource={latestLog ? [latestLog] : []}
        renderItem={renderLogItem}
        locale={{ emptyText: 'Không có hoạt động' }}
      />
    </div>
  );
};

export default ActivityChangedHistory;
