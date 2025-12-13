import { DocumentStatus, IDocument, IFolder } from '@/common/types/document';
import ModalCreateTest from '@/components/modals/ModalCreateTest';
import ModalEditDocument from '@/components/modals/ModalEditDocument';
import { useModal } from '@/hooks/useModal';
import { MoreOutlined } from '@ant-design/icons';
import { useDelete, useOne, useUpdate } from '@refinedev/core';
import {
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconClearAll,
  IconEye,
  IconFileText,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Empty,
  Input,
  List,
  message,
  Modal,
  Popover,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

dayjs.extend(isBetween);

const STATUS_OPTIONS = [
  {
    label: 'Nháp',
    value: 'DRAFT' as DocumentStatus,
    icon: <IconFileText size={15} />,
    color: 'red',
  },
  {
    label: 'Xuất bản',
    value: 'PUBLISHED' as DocumentStatus,
    icon: <IconUpload size={15} />,
    color: 'green',
  },
];

export default function ExamFolderDetail() {
  const { folderId } = useParams();
  const [localFolderData, setLocalFolderData] = useState<IFolder | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);
  const { isOpen, type, openModal } = useModal();
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const isModalEditDocument = isOpen && type === 'ModalEditDocument';
  const isModalCreateTest = isOpen && type === 'ModalCreateTest';
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const {
    data: folderData,
    isLoading,
    refetch,
  } = useOne<IFolder>({
    resource: `documents/folders/${folderId}`,
    id: '',
  });

  const { mutate: deleteDocument } = useDelete();
  const { mutate: updateDocument } = useUpdate();

  useEffect(() => {
    if (folderData?.data) {
      setLocalFolderData(folderData.data);
    }
  }, [folderData]);

  const filteredDocuments = useMemo(() => {
    if (!localFolderData?.documents) return [];

    let result = localFolderData.documents;

    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        doc =>
          doc.title.toLowerCase().includes(lowerSearch) ||
          doc.description?.toLowerCase().includes(lowerSearch) ||
          doc.createdBy?.name?.toLowerCase().includes(lowerSearch),
      );
    }

    if (selectedStatus) {
      result = result.filter(doc => doc.status === selectedStatus);
    }

    if (dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');
      result = result.filter(doc => dayjs(doc.createdAt).isBetween(start, end, null, '[]'));
    }

    return result;
  }, [localFolderData?.documents, searchText, selectedStatus, dateRange]);

  if (isLoading) {
    return (
      <Skeleton active paragraph={{ rows: 4 }} style={{ padding: 20 }} title={{ width: '60%' }} />
    );
  }

  const handleDeleteDocument = (documentId: string) => {
    const prevLocalFolderData = localFolderData;

    setLocalFolderData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId),
      };
    });

    deleteDocument(
      {
        resource: `documents/${documentId}`,
        id: '',
      },
      {
        onSuccess: () => {
          message.success('Xóa đề thi thành công');
          refetch();
        },
        onError: () => {
          setLocalFolderData(prevLocalFolderData);
          message.error('Xóa đề thi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };
  const handleUpdateStatus = (documentId: string, newStatus: DocumentStatus) => {
    const prevLocalFolderData = localFolderData;
    setLocalFolderData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === documentId ? { ...doc, status: newStatus } : doc,
        ),
      };
    });
    updateDocument(
      {
        resource: 'documents',
        id: documentId,
        values: { status: newStatus },
      },
      {
        onSuccess: () => {
          setStatusPopoverOpen(null);
          refetch();
        },
        onError: () => {
          setLocalFolderData(prevLocalFolderData);
          message.error('Cập nhật trạng thái thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };

  const handleEditDocument = (document: IDocument) => {
    setSelectedDocument(document);
    openModal('ModalEditDocument');
  };

  return (
    <div style={{ display: 'flex', height: '100%', padding: 20, gap: 20 }}>
      {/* Left panel */}
      <div style={{ flex: 2 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
            {localFolderData?.name} ({localFolderData?.documents.length || 0})
          </Typography.Title>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Input.Search
              placeholder="Tìm kiếm đề thi..."
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
            />

            <Popover
              trigger="click"
              placement="bottomLeft"
              onOpenChange={setStatusOpen}
              styles={{ body: { padding: 5, width: 150 } }}
              style={{ height: '100%' }}
              arrow={false}
              open={statusOpen}
              content={
                <List
                  size="small"
                  dataSource={[
                    {
                      label: 'Tất cả',
                      value: null,
                      icon: <IconClearAll size={15} color="#8c8c8c" />,
                    },
                    ...STATUS_OPTIONS,
                  ]}
                  renderItem={item => (
                    <List.Item
                      key={item.value ?? 'ALL'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderRadius: 6,
                        background: selectedStatus === item.value ? '#e6f4ff' : 'transparent',
                        transition: 'background-color 0.2s ease',
                        color: '#525252ff',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor =
                          selectedStatus === item.value ? '#e6f4ff' : 'transparent';
                      }}
                      onClick={() => {
                        setSelectedStatus(item.value as DocumentStatus);
                        setStatusOpen(false);
                      }}
                    >
                      {item.icon}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {selectedStatus === item.value && <IconCheck size={14} color="#1890ff" />}
                    </List.Item>
                  )}
                />
              }
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  cursor: 'pointer',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  padding: '0px 7px',
                  background: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#24292f',
                  height: 32,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#646464',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {(() => {
                    const selected = STATUS_OPTIONS.find(opt => opt.value === selectedStatus);
                    return selected ? (
                      <>
                        {selected.icon}
                        {selected.label}
                      </>
                    ) : (
                      'Lọc theo trạng thái'
                    );
                  })()}
                </span>
                <IconChevronRight
                  size={14}
                  style={{
                    transform: statusOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#8c8c8c',
                  }}
                />
              </div>
            </Popover>

            <Popover
              trigger="click"
              placement="bottomLeft"
              open={rangePickerOpen}
              onOpenChange={setRangePickerOpen}
              arrow={false}
              content={
                <div style={{ padding: 3 }}>
                  <DatePicker.RangePicker
                    format="DD/MM/YYYY"
                    value={dateRange}
                    onChange={dates => {
                      setDateRange(dates ?? [null, null]);
                      if (dates && dates[0] && dates[1]) {
                        setRangePickerOpen(false);
                      }
                    }}
                    style={{ width: 260 }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
                </div>
              }
            >
              <Tooltip title="Lọc theo khoảng thời gian">
                <Button
                  type="default"
                  icon={<IconCalendar size={15} color="#646464" />}
                  style={{
                    borderRadius: 6,
                    border: '1px solid #d9d9d9',
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#24292f',
                    background: '#fff',
                    padding: '0px 7px',
                  }}
                >
                  {dateRange[0] && dateRange[1] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 13, color: '#595959' }}>
                        {dayjs(dateRange[0]).format('DD/MM')} →{' '}
                        {dayjs(dateRange[1]).format('DD/MM')}
                      </span>
                      <Button
                        type="text"
                        icon={<IconX size={14} color="#e60f0fff" />}
                        onClick={() => setDateRange([null, null])}
                        style={{
                          border: 'none',
                          color: '#8c8c8c',
                          width: 15,
                          height: 15,
                        }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#646464' }}>
                      Chọn ngày
                    </span>
                  )}
                </Button>
              </Tooltip>
            </Popover>

            <Tooltip title="Tạo đề thi mới">
              <Button
                type="primary"
                icon={<IconPlus size={18} />}
                onClick={() => openModal('ModalCreateTest', { folderId: folderId })}
                style={{
                  borderRadius: 8,
                  background: '#1890ff',
                  border: 'none',
                  fontWeight: 500,
                  height: 32,
                }}
              />
            </Tooltip>
          </div>
        </div>
        {filteredDocuments.length === 0 ? (
          <Empty description={'Không có đề thi nào'} style={{ margin: '100px 0' }} />
        ) : (
          <Table
            size="small"
            dataSource={filteredDocuments}
            columns={[
              {
                title: 'STT',
                dataIndex: 'id',
                key: 'stt',
                align: 'center',
                width: 80,
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: 'Tên đề thi',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Ngày đăng',
                dataIndex: 'createdAt',
                key: 'createdAt',
                sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                render: (createdAt: string) => <span>{dayjs(createdAt).format('DD/MM/YYYY')}</span>,
              },
              {
                title: 'Cập nhật lần cuối',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                render: (createdAt: string) => <span>{dayjs(createdAt).format('DD/MM/YYYY')}</span>,
              },
              {
                title: 'Người đăng',
                dataIndex: ['createdBy', 'name'],
                key: 'createdBy',
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status: string, record: IDocument) => {
                  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
                  return (
                    <Tooltip title="Cập nhật trạng thái">
                      <Popover
                        trigger="click"
                        placement="bottomLeft"
                        open={statusPopoverOpen === record.id}
                        onOpenChange={open => setStatusPopoverOpen(open ? record.id : null)}
                        arrow={false}
                        styles={{ body: { padding: 5, width: 150 } }}
                        content={
                          <List
                            size="small"
                            dataSource={STATUS_OPTIONS}
                            renderItem={item => (
                              <List.Item
                                key={item.value}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 10,
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  borderRadius: 6,
                                  background: status === item.value ? '#e6f4ff' : 'transparent',
                                  transition: 'background-color 0.2s ease',
                                  color: '#525252ff',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.backgroundColor =
                                    status === item.value ? '#e6f4ff' : 'transparent';
                                }}
                                onClick={() => {
                                  if (status !== item.value) {
                                    handleUpdateStatus(record.id, item.value as DocumentStatus);
                                  } else {
                                    setStatusPopoverOpen(null);
                                  }
                                }}
                              >
                                {item.icon}
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {status === item.value && <IconCheck size={14} color="#1890ff" />}
                              </List.Item>
                            )}
                          />
                        }
                      >
                        <Tag
                          icon={statusOption?.icon}
                          color={statusOption?.color || 'default'}
                          style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            width: 'fit-content',
                          }}
                        >
                          {statusOption?.label || status}
                        </Tag>
                      </Popover>
                    </Tooltip>
                  );
                },
              },
              {
                key: 'actions',
                width: 50,
                render: (_, record: IDocument) => (
                  <Popover
                    content={
                      <Space direction="vertical">
                        <Link
                          to={
                            record.type === 'FILE'
                              ? (record.file?.url ?? '#')
                              : (record.linkUrl ?? '#')
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #f0f0f0',
                            borderRadius: 4,
                            padding: 4,
                            color: 'inherit',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <IconEye size={14} style={{ marginRight: 5 }} />
                          Xem chi tiết
                        </Link>

                        <Typography.Text
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #f0f0f0',
                            padding: 4,
                            borderRadius: 4,
                          }}
                          onClick={() => {
                            handleEditDocument(record);
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <IconPencil size={14} style={{ marginRight: 5 }} />
                          Chỉnh sửa
                        </Typography.Text>

                        <Typography.Text
                          type="danger"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 4,
                            padding: 4,
                          }}
                          onClick={() => {
                            Modal.confirm({
                              title: 'Xác nhận xóa',
                              content: 'Bạn có chắc chắn muốn xóa đề thi này?',
                              okText: 'Xóa',
                              cancelText: 'Hủy',
                              okButtonProps: { danger: true },
                              onOk: () => handleDeleteDocument(record.id),
                            });
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <IconTrash size={14} style={{ marginRight: 5 }} />
                          Xóa
                        </Typography.Text>
                      </Space>
                    }
                    trigger="click"
                    placement="left"
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Popover>
                ),
              },
            ]}
            pagination={{ pageSize: 10 }}
          />
        )}
        {isModalCreateTest && <ModalCreateTest onSuccess={refetch} />}
        {isModalEditDocument && selectedDocument && (
          <ModalEditDocument document={selectedDocument} onSuccess={refetch} />
        )}
      </div>
    </div>
  );
}
