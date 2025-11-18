import { UserRole } from '@/common/enum/user';
import { IFolderItem, IHistoryItem } from '@/common/types/exam';
import { useAuth } from '@/hooks/useAuth';
import { getColorFromName } from '@/utils/activity';
import { useCustom, useList, useOne } from '@refinedev/core';
import {
  IconClock,
  IconDice,
  IconFolderFilled,
  IconLink,
  IconPointFilled,
  IconUser,
} from '@tabler/icons-react';
import {
  Button,
  Card,
  Divider,
  Empty,
  List,
  message,
  Pagination,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExamViewer } from './ExamViewer';

const { Title, Text } = Typography;

export default function RandomExam() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<{ title: string; url: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 4;

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
          folderName: i.folderName,
        })) ?? [],
    );
  }, [selectedFolder, history, historyDataAll]);

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return historyList.slice(start, start + pageSize);
  }, [historyList, page]);

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
          folderName: i.folderName,
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
    } catch (e) {
      message.error('Lỗi khi lấy đề thi!');
    }
  }, [selectedFolder, refetchRandom]);

  console.log('his', historyList);
  console.log('pa his', paginatedHistory);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: canViewHistory ? '1fr 420px' : '1fr',
          gap: 5,
          width: '100%',
          height: 'calc(101vh - 103px)',
        }}
      >
        <div style={{ height: '100%' }}>
          <Card
            style={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              height: '100%',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                padding: '18px 48px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  opacity: 0.1,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'white',
                  transform: 'translate(50px, -50px)',
                }}
              />
              <Space align="center" size={20} style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <IconDice size={30} strokeWidth={1.5} />
                </div>
                <div>
                  <Title
                    style={{
                      color: 'white',
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 700,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Lấy Đề Thi Ngẫu Nhiên
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>
                    Chọn thư mục và nhận đề thi được chọn một cách ngẫu nhiên từ hệ thống
                  </Text>
                </div>
              </Space>
            </div>

            <div style={{ padding: '25px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Spin
                    size="large"
                    tip="Đang tải danh sách thư mục..."
                    style={{ display: 'flex', justifyContent: 'center' }}
                  />
                </div>
              ) : (
                <Space direction="vertical" size={32} style={{ width: '100%' }}>
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 20,
                        color: '#0f172a',
                        display: 'block',
                        marginBottom: 14,
                        fontWeight: 600,
                        letterSpacing: '-0.3px',
                      }}
                    >
                      Chọn thư mục đề thi
                    </Text>
                    <Select
                      placeholder="Tìm kiếm thư mục..."
                      size="large"
                      style={{ width: '100%', border: '1px solid #d8d8d8ff', borderRadius: 8 }}
                      onChange={setSelectedFolder}
                      value={selectedFolder}
                      options={folders.map((f: IFolderItem) => ({
                        label: (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <IconFolderFilled
                              size={18}
                              color={getColorFromName(f.name)}
                              style={{ flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 15, fontWeight: 500 }}>{f.name}</span>
                          </div>
                        ),
                        value: f.id,
                      }))}
                      showSearch
                      optionFilterProp="children"
                      bordered={false}
                    />
                  </div>

                  {selectedFolder && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
                        padding: 30,
                        borderRadius: 16,
                        border: '2px solid #b3d8ff',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{ marginBottom: 28 }}>
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(24, 144, 255, 0.35)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <IconDice size={25} color="white" strokeWidth={1.5} />
                        </div>
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            color: '#0f172a',
                            fontSize: 20,
                            fontWeight: 700,
                            letterSpacing: '-0.3px',
                          }}
                        >
                          Sẵn sàng lấy đề thi?
                        </Title>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 15,
                            color: '#475569',
                            marginTop: 8,
                            display: 'block',
                            fontWeight: 500,
                          }}
                        >
                          Nhấn nút để hệ thống chọn ngẫu nhiên một đề thi từ thư mục đã chọn
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleGetExam}
                        loading={loadingRandom}
                        style={{
                          height: 56,
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 10,
                          minWidth: 220,
                          background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                          border: 'none',
                          boxShadow: '0 8px 24px rgba(24, 144, 255, 0.35)',
                          transition: 'all 0.3s ease',
                          letterSpacing: '-0.3px',
                        }}
                        icon={<IconDice size={20} />}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(24, 144, 255, 0.45)';
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #1479d9 0%, #003a80 100%)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.35)';
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)';
                        }}
                      >
                        {loadingRandom ? 'Đang xử lý...' : 'Lấy Đề Thi Ngẫu Nhiên'}
                      </Button>
                    </div>
                  )}

                  {!selectedFolder && (
                    <Empty
                      description={
                        <span style={{ color: '#94a3b8', fontSize: 15 }}>
                          Vui lòng chọn một thư mục để bắt đầu
                        </span>
                      }
                      style={{ padding: '60px 0' }}
                    />
                  )}
                </Space>
              )}
            </div>
          </Card>
        </div>

        {canViewHistory && (
          <div style={{ height: '100%' }}>
            <Card
              style={{
                borderRadius: 10,
                border: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05)',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{
                padding: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                  padding: '20px 24px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    opacity: 0.08,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'white',
                    transform: 'translate(30px, -30px)',
                  }}
                />
                <Space align="center" size={14} style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    <IconClock size={27} strokeWidth={1.5} />
                  </div>
                  <div>
                    <Title
                      level={4}
                      style={{
                        color: 'white',
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: '-0.3px',
                      }}
                    >
                      Lịch Sử Lấy Đề
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
                      {historyList.length} bản ghi
                    </Text>
                  </div>
                </Space>
              </div>

              <div
                style={{
                  padding: '5px 15px',
                  flex: 1,
                  overflowY: 'auto',
                  minHeight: 0,
                }}
              >
                {historyList.length === 0 ? (
                  <Empty
                    description={
                      <span style={{ color: '#cbd5e1', fontSize: 14 }}>Chưa có lịch sử nào</span>
                    }
                    style={{ padding: '60px 0' }}
                  />
                ) : (
                  <div>
                    <List
                      dataSource={paginatedHistory}
                      renderItem={item => (
                        <div
                          key={item.id}
                          style={{
                            background: 'white',
                            padding: '5px 16px',
                            borderRadius: 10,
                            marginBottom: 4,
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.25s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#b3d8ff';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Text
                              strong
                              style={{
                                fontSize: 14,
                                color: '#0f172a',
                                display: 'block',
                                fontWeight: 600,
                              }}
                              ellipsis={{ tooltip: item.title }}
                            >
                              {item.title}
                            </Text>

                            <Space size={6} style={{ fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconFolderFilled
                                  size={13}
                                  strokeWidth={2}
                                  color={getColorFromName(item.folderName)}
                                />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 12, fontWeight: 500, color: '#525252ff' }}
                                >
                                  {item.folderName}
                                </Text>
                              </div>
                            </Space>

                            <Divider style={{ margin: 0, borderColor: '#e2e8f0' }} />

                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    color: '#64748b',
                                  }}
                                >
                                  <IconUser size={12} strokeWidth={2} />
                                  <Text type="secondary" style={{ fontSize: 12, color: '#64748b' }}>
                                    {item.createdBy}
                                  </Text>
                                  <IconPointFilled
                                    size={7}
                                    color="#999"
                                    style={{ margin: '0 3px' }}
                                  />
                                </div>
                                <Text type="secondary" style={{ fontSize: 12, color: '#64748b' }}>
                                  {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
                                </Text>
                              </div>
                              <Button
                                type="link"
                                size="small"
                                href={item.link}
                                target="_blank"
                                icon={<IconLink size={14} strokeWidth={2} />}
                                style={{
                                  padding: '0 8px',
                                  height: 24,
                                  fontSize: 12,
                                  color: '#1890ff',
                                  fontWeight: 600,
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                Xem đề
                              </Button>
                            </Space>
                          </Space>
                        </div>
                      )}
                    />
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={historyList.length}
                      onChange={setPage}
                      style={{ marginTop: 9, textAlign: 'center' }}
                      align="end"
                      size="small"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
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
