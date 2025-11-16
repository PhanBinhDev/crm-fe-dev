import { UserRole } from '@/common/enum/user';
import { IFolderItem, IHistoryItem } from '@/common/types/exam';
import { useAuth } from '@/hooks/useAuth';
import { useCustom, useList, useOne } from '@refinedev/core';
import { IconFolderFilled, IconLink } from '@tabler/icons-react';
import { Button, Card, Empty, List, Select, Space, Spin, Typography, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExamViewer } from './ExamViewer';

export default function RandomExam() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<{ title: string; url: string } | null>(null);

  const { user } = useAuth();

  const { data: folderData, isLoading } = useList({
    resource: 'documents/folders',
  });
  const folders = useMemo(() => {
    return (folderData as any)?.data?.folders ?? [];
  }, [folderData]);

  const { data: historyDataAll } = useOne({
    resource: `documents/history/all`,
    id: '',
  });

  const canViewHistory = useMemo(() => {
    return user?.role === UserRole.SUPERADMIN || user?.role === UserRole.CNBM;
  }, [user]);

  const historyList: IHistoryItem[] = useMemo(() => {
    if (selectedFolder) return history;

    const raw = (historyDataAll as any)?.data?.folders ?? [];

    return raw.flatMap(
      (f: any) =>
        f.items?.map((i: any) => ({
          id: i.documentId,
          title: i.title,
          link: i.fileUrl,
          createdAt: i.createdAt,
          createdBy: i.createdByUserName,
        })) ?? [],
    );
  }, [selectedFolder, history, historyDataAll]);

  const { isLoading: loadingRandom, refetch: refetchRandom } = useOne({
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
          createdBy: i.createdByUserName,
        })),
      );
    };

    loadHistory();
  }, [selectedFolder]);

  const handleGetExam = useCallback(async () => {
    if (!selectedFolder) return message.warning('Bạn chưa chọn thư mục!');

    try {
      const res: any = await refetchRandom();
      const data = res?.data?.data;

      if (res.error && res.error.status === 404)
        return message.error('Thư mục không có đề thi! Vui lòng chọn thư mục khác.');

      if (!data) return message.error('Có lỗi xảy ra. Vui lòng thử lại sau!');

      setCurrentExam({ title: data.title, url: data.fileUrl });
      setViewerOpen(true);
      message.success('Lấy đề thi thành công!');
    } catch (e) {
      message.error('Lỗi khi lấy đề thi!');
    }
  }, [selectedFolder, refetchRandom]);

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
      {canViewHistory && (
        <div style={{ width: 400 }}>
          <Typography.Title level={4}>📜 Lịch sử lấy đề thi</Typography.Title>

          <Card
            style={{
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '16px 20px',
            }}
          >
            {historyList.length === 0 ? (
              <Empty description="Chưa có lịch sử nào" />
            ) : (
              <List
                dataSource={historyList}
                renderItem={item => (
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
                      <Typography.Text strong>Đề: {item.title}</Typography.Text>
                      <br />
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <Typography.Text type="secondary">
                          Người tạo: {item.createdBy}
                        </Typography.Text>
                        <Typography.Link
                          style={{ display: 'flex', alignItems: 'center' }}
                          href={item.link}
                          target="_blank"
                        >
                          <IconLink size={14} /> Mở đề
                        </Typography.Link>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      )}

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
