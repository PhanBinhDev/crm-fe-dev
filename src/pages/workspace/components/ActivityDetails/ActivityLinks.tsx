import { IActivityLinks } from '@/common/types';
import { formatTime } from '@/services/utils/formatter';
import { useDelete, useInvalidate, useList } from '@refinedev/core';
import { IconPointFilled, IconX } from '@tabler/icons-react';
import { Avatar, Card, List, message, Skeleton, Tooltip, Typography } from 'antd';
const { Paragraph } = Typography;
interface ActivityLinksProps {
  viewMode: 'list' | 'category';
  activityId: string;
}

const LinkCardSkeleton = () => (
  <Card
    hoverable
    style={{ borderRadius: 12, boxShadow: '0 3px 3px rgba(0, 0, 0, 0.1)' }}
    styles={{
      body: { display: 'flex', gap: 16, padding: 12 },
    }}
  >
    <div style={{ flex: 1 }}>
      <Skeleton.Input style={{ width: 100, marginBottom: 4 }} active size="small" />{' '}
      <Skeleton.Input style={{ width: '90%', marginBottom: 4 }} active size="small" />{' '}
      <Skeleton.Input style={{ width: '85%', marginBottom: 8 }} active size="small" />{' '}
      <Skeleton.Input style={{ width: '95%', marginBottom: 0 }} active size="small" />{' '}
    </div>
    <Skeleton.Image active style={{ width: 100, height: 100, borderRadius: 8 }} />
  </Card>
);

const ActivityLinks = ({ viewMode, activityId }: ActivityLinksProps) => {
  const invalidate = useInvalidate();
  const { mutate: deleteLink } = useDelete();
  const { data, isLoading } = useList<IActivityLinks>({
    resource: `activities/${activityId}/links`,
    queryOptions: {
      enabled: !!activityId,
    },
  });
  const listLink = data?.data;

  if (isLoading) {
    return (
      <div
        style={{
          padding: 12,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 8,
        }}
      >
        <LinkCardSkeleton />
        <LinkCardSkeleton />
      </div>
    );
  }

  if (listLink?.length === 0) {
    return (
      <div
        style={{ width: '100%', padding: '30px', textAlign: 'center', fontSize: 13, color: '#999' }}
      >
        <span> Chưa có liên kết nào</span>
      </div>
    );
  }
  const handleDeleteLink = (id: string) => {
    console.log('link id', id);
    deleteLink(
      {
        resource: `activities/${activityId}/links`,
        id: id,
      },
      {
        onSuccess: () => {
          invalidate({
            resource: `activities/${activityId}/links`,
            invalidates: ['list'],
          });
          message.success('Xoá liên kết thành công');
        },
        onError: () => {
          message.error('Xoá liên kết thất bại');
        },
      },
    );
  };

  if (viewMode === 'list') {
    return (
      <div style={{ padding: 8, maxHeight: 'calc(90vh - 97px)', overflowY: 'auto' }}>
        <List
          size="small"
          dataSource={listLink || []}
          renderItem={item => {
            return (
              <List.Item
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconPointFilled size={8} color="#888" style={{ marginRight: 3 }} />
                    <div style={{ fontSize: 11, color: '#909090ff' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, marginRight: 5 }}>
                        {item.username} vuong thi diem
                      </span>
                      {formatTime(item.createdAt)}
                    </div>
                  </div>
                  <Tooltip title="Xoá liên kết">
                    <IconX
                      size={13}
                      color="#888"
                      onClick={() => handleDeleteLink(item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </Tooltip>
                </div>

                <div style={{ marginLeft: 10 }}>
                  <a
                    href={item.imageUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: '#1677ff' }}
                  >
                    {item.title}
                  </a>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 8,
        maxHeight: 'calc(90vh - 97px)',
        overflowY: 'auto',
      }}
    >
      {(listLink || []).map((item, index) => (
        <div style={{ position: 'relative' }}>
          <Card
            key={index}
            hoverable
            style={{ borderRadius: 12, boxShadow: '0 3px 3px rgba(0, 0, 0, 0.1)' }}
            styles={{
              body: { display: 'flex', gap: 16, padding: '10px 0' },
            }}
            onClick={() => {
              if (item.link || '#') {
                window.open(item.link, '_blank');
              }
            }}
          >
            <div style={{ flex: 1, maxHeight: 100, overflow: 'hidden' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {item.username || 'Chưa xác định'}
              </span>
              <p style={{ fontSize: 11, color: '#909090ff', marginBottom: 7 }}>
                {formatTime(item.createdAt)}
              </p>
              <Paragraph
                strong
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 5, fontSize: 13, lineHeight: 1.2 }}
              >
                {item.title}
              </Paragraph>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ fontSize: 12, lineHeight: 1.3 }}
              >
                {item.description}
              </Paragraph>
            </div>
            <Avatar
              src={item.imageUrl || 'https://via.placeholder.com/100'}
              shape="square"
              size={100}
              style={{ borderRadius: 8 }}
            />
          </Card>
          <Tooltip title="Xoá liên kết">
            <IconX
              size={14}
              color="#888"
              onClick={() => handleDeleteLink(item.id)}
              style={{
                position: 'absolute',
                top: 5,
                right: 4,
                cursor: 'pointer',
                background: '#eeeeeeff',
                borderRadius: '50%',
                padding: 3,
              }}
            />
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default ActivityLinks;
