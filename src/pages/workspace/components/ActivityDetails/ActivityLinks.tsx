import { IActivityLinks, ILinkPreview } from '@/common/types';
import { formatTime } from '@/services/utils/formatter';
import { useDelete, useList } from '@refinedev/core';
import { IconPointFilled, IconX } from '@tabler/icons-react';
import { Avatar, Card, List, message, Popconfirm, Skeleton, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
const { Paragraph } = Typography;
interface ActivityLinksProps {
  viewMode: 'list' | 'category';
  activityId: string;
}
interface LinkAvatarProps {
  linkPreview?: ILinkPreview;
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
  const { mutate: deleteLink } = useDelete();
  const [links, setLinks] = useState<IActivityLinks[]>([]);
  const { data, isLoading } = useList<IActivityLinks>({
    resource: `activities/${activityId}/links`,
    queryOptions: {
      enabled: !!activityId,
      onSuccess: res => {
        setLinks(res.data);
      },
    },
  });

  const listLink = useMemo(() => {
    if (!data?.data || isLoading) return [] as IActivityLinks[];
    return data.data;
  }, [data, isLoading]);

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
    const oldLinks = [...links];

    setLinks(prev => prev.filter(l => l.id !== id));
    deleteLink(
      {
        resource: `activities/${activityId}/links`,
        id: id,
      },
      {
        onSuccess: () => {
          console.log(message.success);
        },
        onError: error => {
          setLinks(oldLinks);
          console.log(error);
        },
      },
    );
  };

  const LinkAvatar = ({ linkPreview }: LinkAvatarProps) => {
    const [imgSrc, setImgSrc] = useState(linkPreview?.thumbnail || linkPreview?.favicon);
    const [error, setError] = useState(false);

    const handleError = () => {
      if (imgSrc === linkPreview?.thumbnail && linkPreview?.favicon) {
        setImgSrc(linkPreview.favicon);
        return true;
      } else {
        setError(true);
        return false;
      }
    };

    return (
      <Avatar
        src={error ? undefined : imgSrc}
        alt={linkPreview?.siteName}
        shape="square"
        size={100}
        style={{ borderRadius: 8, objectFit: 'contain' }}
        onError={handleError}
      >
        {linkPreview?.siteName?.charAt(0) || 'CRM'}
      </Avatar>
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
                        {item.creator.name || 'Chưa xác định'}
                      </span>
                      <Tooltip title={dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}>
                        {formatTime(item.createdAt)}
                      </Tooltip>
                    </div>
                  </div>
                  <Popconfirm
                    title="Xác nhận xóa liên kết?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteLink(item.id)}
                  >
                    <Tooltip title="Xoá liên kết">
                      <IconX size={13} color="#888" style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  </Popconfirm>
                </div>

                <div style={{ marginLeft: 10 }}>
                  <a
                    href={item.url || '#'}
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
            onDoubleClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(item.url || '');
              message.success('Đã sao chép liên kết!');
            }}
          >
            <div style={{ flex: 1, maxHeight: 100, overflow: 'hidden' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {item.creator.name || 'Chưa xác định'}
              </span>
              <p style={{ fontSize: 11, color: '#909090ff', marginBottom: 7 }}>
                <Tooltip title={dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}>
                  {formatTime(item.createdAt)}
                </Tooltip>
              </p>
              <Paragraph
                strong
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 5, fontSize: 13, lineHeight: 1.2 }}
                onClick={() => {
                  if (item.url || '#') {
                    window.open(item.url, '_blank');
                  }
                }}
              >
                {item.title}
              </Paragraph>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ fontSize: 12, lineHeight: 1.3 }}
              >
                {item.description || item.linkPreview?.siteDescription}
              </Paragraph>
            </div>
            <LinkAvatar linkPreview={item.linkPreview} />
          </Card>
          <Popconfirm
            title="Xác nhận xóa liên kết?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteLink(item.id)}
          >
            <Tooltip title="Xoá liên kết">
              <IconX
                size={14}
                color="#888"
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
          </Popconfirm>
        </div>
      ))}
    </div>
  );
};

export default ActivityLinks;
