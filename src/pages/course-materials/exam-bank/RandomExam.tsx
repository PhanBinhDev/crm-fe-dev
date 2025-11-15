import { useCustom, useList, useOne } from '@refinedev/core';
import { IconFolderFilled, IconLink, IconShare } from '@tabler/icons-react';
import { Button, Card, Empty, List, Select, Space, Spin, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { ExamViewer } from './ExamViewer';
import { ShareModal } from './ShareModal';

export default function RandomExam() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<{ title: string; url: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { data: folderData, isLoading } = useList({ resource: 'documents/folders' });
  const folders = (folderData as any)?.data?.folders ?? [];

  const { data: historyDataAll, isLoading: loadingHistory } = useOne({
    resource: `documents/history/all`,
    id: '',
  });

  console.log('all', historyDataAll);

  const {
    data: randomApi,
    isLoading: loadingRandom,
    refetch: refetchRandom,
  } = useOne({
    resource: `/documents/folders/${selectedFolder}/random`,
    id: '',
  });

  const historyApi = useCustom({
    url: selectedFolder ? `/documents/folders/${selectedFolder}/history` : '',
    method: 'get',
    queryOptions: { enabled: false },
  });

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedFolder) return;

      const res: any = await historyApi.refetch();
      const items = res?.data?.data?.items ?? [];

      setHistory(
        items.map((i: any) => ({
          id: i.documentId,
          title: i.title,
          link: i.fileUrl,
          createdAt: i.createdAt,
        })),
      );
    };

    loadHistory();
  }, [selectedFolder]);

  const handleGetExam = async () => {
    if (!selectedFolder) return message.warning('Bạn chưa chọn thư mục!');
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const recentHistory = history.filter(h => new Date(h.createdAt) > twoHoursAgo);

    if (recentHistory.length > 0) {
      message.warning('Trong vòng 2 tiếng bạn không thể lấy thêm đề mới từ thư mục này!');
      return;
    }

    try {
      const res: any = await refetchRandom();
      const data = res?.data?.data;

      if (res.error.status === 404)
        return message.error('Thư mục không có đề thi! Vui lòng chọn thư mục khác.');

      if (!data) return message.error('Có lỗi xảy ra. Vui lòng thử lại sau!');

      const isDuplicate = history.some(h => h.id === data.documentId);
      if (isDuplicate) {
        message.warning('Đề này đã được lấy trước đó, thử lại!');
        return;
      }

      const link = data.fileUrl;
      setHistory(prev => [
        { id: data.documentId, title: data.title, link, createdAt: data.createdAt },
        ...prev,
      ]);

      window.open(link, '_blank');

      const historyRes: any = await historyApi.refetch();
      const items = historyRes?.data?.data?.items ?? [];

      setHistory(
        items.map((i: any) => ({
          id: i.documentId,
          title: i.title,
          link: i.fileUrl,
          createdAt: i.createdAt,
        })),
      );
    } catch (e) {
      message.error('Lỗi khi lấy đề thi!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        padding: '32px 56px',
        display: 'flex',
        gap: 32,
      }}
    >
      <div style={{ flex: 1 }}>
        <Typography.Title level={3}>Lấy Đề Thi Ngẫu Nhiên</Typography.Title>
        <Card
          style={{
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '32px 28px',
          }}
        >
          {isLoading ? (
            <Spin tip="Đang tải thư mục..." />
          ) : (
            <Select
              placeholder="Chọn thư mục"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={setSelectedFolder}
              options={folders.map((f: any) => ({
                label: (
                  <Space>
                    <IconFolderFilled size={16} color="#3b82f6" /> {f.name}
                  </Space>
                ),
                value: f.id,
              }))}
            />
          )}

          {selectedFolder && (
            <Button
              type="primary"
              onClick={handleGetExam}
              disabled={loadingRandom}
              style={{ width: '100%' }}
            >
              {loadingRandom ? 'Đang tải...' : 'Lấy đề thi'}
            </Button>
          )}
        </Card>
      </div>

      <div style={{ width: 400 }}>
        <Typography.Title level={4}>📜 Lịch sử lấy đề thi</Typography.Title>

        <Card
          style={{
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '16px 20px',
          }}
        >
          {history.length === 0 ? (
            <Empty description="Chưa có lịch sử nào" />
          ) : (
            <List
              dataSource={history}
              renderItem={(item, index) => (
                <List.Item
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '8px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Typography.Text strong>
                      Đề số {history.length - index}: {item.title}
                    </Typography.Text>
                    <br />
                    <Typography.Link href={item.link} target="_blank">
                      <IconLink size={14} /> Mở đề
                    </Typography.Link>
                  </div>
                  <Tooltip title="Chia sẻ link">
                    <Button
                      type="text"
                      icon={<IconShare size={16} />}
                      onClick={() => {
                        setShareLink(item.link);
                        setShareModalOpen(true);
                      }}
                    />
                  </Tooltip>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      {currentExam && (
        <ExamViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={currentExam.url}
          fileName={currentExam.title}
        />
      )}

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        link={shareLink || ''}
      />
    </div>
  );
}
