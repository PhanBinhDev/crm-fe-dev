import { IFolder } from '@/common/types/document';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconCalendar, IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Divider,
  Empty,
  Input,
  Modal,
  Popover,
  Row,
  Skeleton,
  Tooltip,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderCard from './FolderCard';

export default function ExamBank() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<IFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);

  const { data, isLoading, refetch } = useList<{ data: { folders: IFolder[] } }>({
    resource: 'documents/folders',
  });
  const { mutate: createFolder, isLoading: creating } = useCreate();
  const { mutate: deleteFolder } = useDelete();
  const { mutate: updateFolder, isLoading: updating } = useUpdate();

  const folders: IFolder[] = Array.isArray((data as any)?.data?.folders)
    ? (data as any).data.folders
    : [];

  console.log('folder', data);

  const filteredFolders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = folders.filter(
      f =>
        f.name?.toLowerCase().includes(keyword) ||
        f.description?.toLowerCase().includes(keyword) ||
        (f.totalDocuments?.toString() || '').includes(keyword) ||
        f.createdBy?.name.toLowerCase().includes(keyword),
    );

    if (dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');
      result = result.filter(doc => dayjs(doc.createdAt).isBetween(start, end, null, '[]'));
    }
    return result;
  }, [folders, search, dateRange]);

  const openCreateModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (folder: IFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setDescription(folder.description || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFolder(null);
    setFolderName('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!folderName.trim()) {
      message.warning('Vui lòng nhập tên thư mục!');
      return;
    }

    if (editingFolder) {
      updateFolder(
        {
          resource: 'documents/folders',
          id: editingFolder.id,
          values: {
            name: folderName,
            description: description || `Thư mục chứa tài liệu ${folderName}`,
          },
        },
        {
          onSuccess: () => {
            message.success(`Đã cập nhật thư mục "${folderName}"`);
            closeModal();
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể cập nhật thư mục!');
          },
        },
      );
    } else {
      createFolder(
        {
          resource: 'documents/folders',
          values: {
            name: folderName,
            description: description || `Thư mục chứa tài liệu ${folderName}`,
          },
        },
        {
          onSuccess: () => {
            message.success('Tạo thư mục thành công!');
            closeModal();
            refetch();
          },
          onError: () => {
            message.error('Không thể tạo thư mục mới!');
          },
        },
      );
    }
  };

  const handleDeleteFolder = (id: string, name: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${name}" không?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteFolder(
          { resource: 'documents/folders', id },
          {
            onSuccess: () => {
              message.success(`Đã xóa thư mục "${name}"`);
              refetch();
              navigate('/exams/bank');
            },
            onError: (err: any) => {
              message.error(
                err?.response?.data?.message || 'Không thể xóa thư mục (có thể đang được sử dụng)!',
              );
            },
          },
        );
      },
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
        <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
          Thư Mục Đề Thi ({folders?.length})
        </Typography.Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Input.Search
            placeholder="Tìm kiếm thư mục..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 250 }}
          />

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
                      {dayjs(dateRange[0]).format('DD/MM')} → {dayjs(dateRange[1]).format('DD/MM')}
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
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#646464' }}>Chọn ngày</span>
                )}
              </Button>
            </Tooltip>
          </Popover>

          <Tooltip title="Tạo thư mục">
            <Button
              type="primary"
              icon={<IconPlus size={18} />}
              onClick={openCreateModal}
              loading={creating}
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

      {filteredFolders.length === 0 && !isLoading && (
        <Empty
          description={search ? 'Không tìm thấy thư mục' : 'Chưa có thư mục nào'}
          style={{ margin: '100px 0' }}
        />
      )}
      <div>
        {isLoading ? (
          <Row gutter={[16, 20]}>
            {[...Array(6)].map((_, index) => (
              <div key={index} style={{ width: '25%', padding: '0 8px 10px 8px' }}>
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              </div>
            ))}
          </Row>
        ) : (
          <div>
            <Row gutter={[16, 20]}>
              {filteredFolders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onNavigate={id => navigate(`/exams/bank/${id}`)}
                  onEdit={openEditModal}
                  onDelete={handleDeleteFolder}
                />
              ))}
            </Row>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText={editingFolder ? 'Lưu thay đổi' : 'Tạo thư mục'}
        cancelText="Hủy"
        confirmLoading={creating || updating}
        centered
        width={570}
        footer={null}
        closeIcon={null}
        title={
          <div
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                {editingFolder ? 'Chỉnh sửa thư mục' : 'Tạo thư mục mới'}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  lineHeight: 1.5,
                }}
              >
                {editingFolder
                  ? 'Cập nhật tên và mô tả cho thư mục hiện tại để quản lý tài liệu tốt hơn.'
                  : 'Nhập thông tin cho thư mục mới để tổ chức tài liệu của bạn một cách khoa học.'}
              </p>
            </div>

            <Button
              type="text"
              style={{
                borderRadius: '100%',
                marginBottom: 2,
                background: '#0000000a',
              }}
              onClick={closeModal}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              icon={
                <IconX
                  size={15}
                  style={{
                    color: '#888',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                />
              }
              onMouseEnter={e => {
                e.currentTarget.style.background = '#dbdbdbff';
                e.currentTarget.style.color = '#222';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000000a';
                e.currentTarget.style.color = '#888';
              }}
            />
          </div>
        }
      >
        <Divider style={{ margin: '0 0 15px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#374151',
                marginBottom: 3,
              }}
            >
              Tên thư mục <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              placeholder="Nhập tên thư mục..."
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onPressEnter={handleSubmit}
              maxLength={80}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#374151',
                marginBottom: 3,
              }}
            >
              Mô tả
            </label>
            <Input.TextArea
              placeholder="Thêm mô tả (tùy chọn)..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 15,
            gap: 8,
          }}
        >
          <Button onClick={closeModal}>Hủy</Button>
          <Button type="primary" onClick={handleSubmit} loading={creating || updating}>
            {editingFolder ? 'Lưu thay đổi' : 'Tạo thư mục'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
