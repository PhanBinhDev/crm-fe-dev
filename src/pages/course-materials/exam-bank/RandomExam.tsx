import { useList, useOne } from '@refinedev/core';
import { IconFolderFilled, IconLink, IconShare } from '@tabler/icons-react';
import { Button, Card, Empty, List, Select, Space, Spin, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { ExamViewer } from './ExamViewer';
import { ShareModal } from './ShareModal';

export default function RandomExam() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<{ title: string; url: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { data: folderData, isLoading } = useList({ resource: 'documents/folders' });
  const folders = (folderData as any)?.data?.folders ?? [];

  const { data: selectedFolderData, isLoading: loadingDocs } = useOne({
    resource: `documents/folders/${selectedFolder}`,
    id: '',
    queryOptions: { enabled: !!selectedFolder },
  });

  useEffect(() => {
    if (selectedFolderData?.data?.documents) {
      setDocuments(selectedFolderData.data.documents);
    }
  }, [selectedFolderData]);

  const handleGetExam = () => {
    if (!documents.length) return message.warning('Thư mục này chưa có đề thi nào!');

    const randomIndex = Math.floor(Math.random() * documents.length);
    const selected = documents[randomIndex];
    const link =
      selected.type === 'FILE'
        ? selected.file?.url
        : selected.type === 'LINK'
          ? selected.linkUrl
          : '#';

    setHistory(prev => [{ id: selected.id, title: selected.title, link }, ...prev.slice(0, 9)]);
    setCurrentExam({ title: selected.title, url: link });
    setViewerOpen(true);
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
              disabled={loadingDocs}
              style={{ width: '100%' }}
            >
              {loadingDocs ? 'Đang tải...' : 'Lấy đề thi'}
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
