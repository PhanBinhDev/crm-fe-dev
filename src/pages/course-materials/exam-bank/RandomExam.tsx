import { IFolderItem, IHistoryItem } from '@/common/types/exam';
import { useCustom, useList, useOne } from '@refinedev/core';
import { IconFolderFilled } from '@tabler/icons-react';
import { Button, Card, Select, Space, Spin, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { ExamViewer } from './ExamViewer';

export default function RandomExam() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<{ title: string; url: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { data: folderData, isLoading } = useList({
    resource: 'documents/folders',
  });
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
    resource: `documents/folders/${selectedFolder}/random`,
    id: '',
  });

  const historyApi = useCustom({
    url: selectedFolder ? `documents/folders/${selectedFolder}/history` : '',
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

  console.log('hiss', history);

  const handleGetExam = useCallback(async () => {
    if (!selectedFolder) return message.warning('Bạn chưa chọn thư mục!');
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const recentHistory = history.filter(h => new Date(h.createdAt) > twoHoursAgo);

    // if (recentHistory.length > 0) {
    //   message.warning('Trong vòng 2 tiếng bạn không thể lấy thêm đề mới từ thư mục này!');
    //   return;
    // }

    try {
      const res: any = await refetchRandom();
      const data = res?.data?.data;

      if (res.error && res.error.status === 404)
        return message.error('Thư mục không có đề thi! Vui lòng chọn thư mục khác.');

      if (!data) return message.error('Có lỗi xảy ra. Vui lòng thử lại sau!');

      const link = data.fileUrl;
      setCurrentExam({ title: data.title, url: data.fileUrl });
      setShareLink(link);
      setViewerOpen(true);
      setShareModalOpen(true);
      message.success('Lấy đề thi thành công!');
    } catch (e) {
      message.error('Lỗi khi lấy đề thi!');
    }
  }, [selectedFolder, history]);

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
              options={folders.map((f: IFolderItem) => ({
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

      {currentExam && (
        <ExamViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={currentExam.url}
          fileName={currentExam.title}
        />
      )}
    </div>
  );
}
