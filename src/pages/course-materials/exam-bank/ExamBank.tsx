import { paginationConfigOptions } from '@/config/pagination';
import { useCreate, useDelete, useList, useTable, useUpdate } from '@refinedev/core';
import {
  IconFolderFilled,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  Modal,
  Pagination,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export default function ExamBank() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolder, setNewFolder] = useState('');
  const [description, setDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { tableQueryResult, current, setCurrent, pageSize, setPageSize } = useTable({
    resource: 'documents/folders',
    pagination: {
      pageSize: 8,
    },
  });

  const folders: Folder[] = Array.isArray((tableQueryResult as any)?.data?.data?.folders)
    ? (tableQueryResult as any).data.data.folders
    : [];

  const { mutate: createFolder, isLoading: creating } = useCreate();
  const { mutate: deleteFolder } = useDelete();
  const { mutate: updateFolder } = useUpdate();
  const { data: filesData } = useList({
    resource: 'documents',
  });

  const filteredFolders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return folders.filter(f => f.name?.toLowerCase().includes(keyword));
  }, [folders, search]);
  const getFileCountByFolder = (folderId: string) => {
    if (!Array.isArray(filesData?.data)) return 0;
    return filesData.data.filter((file: any) => file.folderId === folderId).length;
  };

  const handleCreateFolder = async () => {
    if (!newFolder.trim()) {
      message.warning('Vui lòng nhập tên thư mục!');
      return;
    }
    createFolder(
      {
        resource: 'documents/folders',
        values: { name: newFolder, description: description || `Thư mục ${newFolder}` },
      },
      {
        onSuccess: () => {
          message.success('Tạo thư mục thành công!');
          setIsModalOpen(false);
          setNewFolder('');
          setDescription('');
        },
        onError: () => message.error('Không thể tạo thư mục mới!'),
      },
    );
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
            },
            onError: (err: any) =>
              message.error(
                err?.response?.data?.message || 'Không thể xóa thư mục (có thể đang được sử dụng)!',
              ),
          },
        );
      },
    });
  };

  const handleEditFolder = (folder: Folder) => {
    let updatedName = folder.name;
    let updatedDescription = folder.description || '';
    Modal.confirm({
      title: 'Sửa thư mục',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Input defaultValue={folder.name} onChange={e => (updatedName = e.target.value)} />
          <Input
            defaultValue={folder.description}
            onChange={e => (updatedDescription = e.target.value)}
          />
        </div>
      ),
      okText: 'Lưu',
      cancelText: 'Hủy',
      onOk: () => {
        if (!updatedName.trim()) return message.warning('Tên thư mục không được để trống!');
        updateFolder(
          {
            resource: 'documents/folders',
            id: folder.id,
            values: { name: updatedName, description: updatedDescription },
          },
          {
            onSuccess: () => {
              message.success(`Đã cập nhật thư mục "${updatedName}"`);
            },
            onError: (err: any) =>
              message.error(err?.response?.data?.message || 'Không thể cập nhật thư mục!'),
          },
        );
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '32px 56px' }}>
      {/* Header */}
      <Typography.Title level={3} style={{ marginBottom: 24, fontWeight: 700, color: '#111827' }}>
        Ngân hàng đề thi
      </Typography.Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Input
          prefix={<IconSearch size={18} color="#9ca3af" />}
          placeholder="Tìm kiếm"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 260,
            borderRadius: 8,
            height: 40,
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        />
        <Space size={10} wrap>
          <Button
            icon={viewMode === 'grid' ? <IconList size={18} /> : <IconLayoutGrid size={18} />}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              height: 40,
            }}
          />
          <Button
            type="primary"
            icon={<IconPlus size={18} />}
            onClick={() => setIsModalOpen(true)}
            loading={creating}
            style={{
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              fontWeight: 500,
              height: 40,
            }}
          >
            Tạo mới
          </Button>
        </Space>
      </div>

      <div>
        {!folders.length ? (
          <Empty description="Chưa có thư mục nào" />
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {folders.map(folder => (
              <Card
                key={folder.id}
                onClick={() => navigate(`/exams/bank/${folder.id}`)}
                style={{
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  height: 110,
                  position: 'relative',
                }}
                bodyStyle={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                }}
                hoverable
              >
                <Dropdown
                  menu={{
                    items: [
                      { key: 'edit', label: 'Rename' },
                      { key: 'delete', label: 'Delete', danger: true },
                    ],
                    onClick: info => {
                      info.domEvent.stopPropagation();
                      if (info.key === 'edit') handleEditFolder(folder);
                      else handleDeleteFolder(folder.id, folder.name);
                    },
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    shape="circle"
                    icon={<span style={{ fontSize: 20 }}>⋮</span>}
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#9ca3af',
                    }}
                  />
                </Dropdown>

                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #60a5fa, #3b82f6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconFolderFilled size={30} color="#fff" />
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Tooltip title={folder.name}>
                    <Typography.Text
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#111827',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {folder.name}
                    </Typography.Text>
                  </Tooltip>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {getFileCountByFolder(folder.id)} files
                  </Typography.Text>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={folders}
            pagination={false}
            onRow={record => ({
              onClick: () => navigate(`/exams/bank/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            columns={[
              {
                title: 'Tên',
                dataIndex: 'name',
                render: (text: string) => (
                  <Space>
                    <IconFolderFilled size={20} color="#3b82f6" />
                    <Typography.Text strong>{text}</Typography.Text>
                  </Space>
                ),
              },
              { title: 'Người tạo', dataIndex: 'createdBy', render: v => v || '—' },
              { title: 'Ngày tạo', dataIndex: 'createdAt', render: v => v || '—' },
            ]}
          />
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          {...paginationConfigOptions(
            {
              pagination: {
                current,
                pageSize,
                total: tableQueryResult?.data?.total ?? folders.length,
                onChange: (page: number) => setCurrent(page),
              },
            },
            (size: number) => setPageSize(size),
          )}
        />
      </div>

      <Modal
        title="Tạo thư mục mới"
        open={isModalOpen}
        onOk={handleCreateFolder}
        onCancel={() => setIsModalOpen(false)}
        okText="Tạo"
        cancelText="Hủy"
        centered
      >
        <Input
          placeholder="Nhập tên thư mục"
          value={newFolder}
          onChange={e => setNewFolder(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input.TextArea
          placeholder="Mô tả (không bắt buộc)"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Modal>
    </div>
  );
}
