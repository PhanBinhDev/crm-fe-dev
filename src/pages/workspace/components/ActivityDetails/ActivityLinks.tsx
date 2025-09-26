import { useList } from '@refinedev/core';
import { IconFile, IconPointFilled } from '@tabler/icons-react';
import { List, Skeleton } from 'antd';

interface ActivityLinksProps {
  activityId: string;
  viewMode: 'list' | 'category';
}

const ActivityLinks = ({ activityId, viewMode }: ActivityLinksProps) => {
  const { data: dataLinks, isLoading } = useList({
    resource: `activities/${activityId}/files`,
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  if (!dataLinks?.data || dataLinks.data.length === 0) {
    return (
      <div
        style={{ width: '100%', padding: '30px', textAlign: 'center', fontSize: 13, color: '#999' }}
      >
        <span> Chưa có liên kết nào</span>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div style={{ padding: 10 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div>
        <List
          size="small"
          bordered={false}
          dataSource={dataLinks.data}
          renderItem={item => (
            <List.Item
              style={{
                border: 'none',
                display: 'flex',
                gap: 4,
                alignItems: 'flex-start',
                color: '#666666ff',
                margin: '5px 10px 0 0',
                padding: ' 0 10px',
              }}
            >
              <div>
                <IconPointFilled size={10} color="#666666ff" />
              </div>
              <div style={{ width: '100%' }}>
                {item.fileUrl ? (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#1677ff' }}
                  >
                    {item.fileName}
                  </a>
                ) : (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <IconFile size={14} />
                    <span style={{ fontSize: 12 }}>{item.fileName}</span>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {dataLinks.data.map(item => (
        <div
          key={item.id}
          style={{
            background: '#fff',
            border: '1px solid #eaeaea',
            borderRadius: 8,
            padding: 10,
            fontSize: 12,
          }}
        >
          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1677ff' }}
            >
              {item.fileName}
            </a>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <IconFile size={14} />
              <span>{item.fileName}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActivityLinks;
