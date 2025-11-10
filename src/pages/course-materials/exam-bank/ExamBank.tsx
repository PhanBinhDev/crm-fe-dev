import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconPlus } from '@tabler/icons-react';
import { Button, Empty, Input, Modal, Row, Skeleton, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderCard from './FolderCard';

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

  const { data, isLoading, refetch } = useList<{ data: { folders: Folder[] } }>({
    resource: 'documents/folders',
  });
  const { mutate: createFolder, isLoading: creating } = useCreate();
  const { mutate: deleteFolder } = useDelete();
  const { mutate: updateFolder } = useUpdate();

  const folders: Folder[] = Array.isArray((data as any)?.data?.folders)
    ? (data as any).data.folders
    : [];

  const filteredFolders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return folders.filter(f => f.name?.toLowerCase().includes(keyword));
  }, [folders, search]);

  const handleCreateFolder = async () => {
    if (!newFolder.trim()) {
      message.warning('Vui lòng nhập tên thư mục!');
      return;
    }

    createFolder(
      {
        resource: 'documents/folders',
        values: {
          name: newFolder,
          description: description || `Thư mục chứa tài liệu ${newFolder}`,
        },
      },
      {
        onSuccess: () => {
          message.success('Tạo thư mục thành công!');
          setIsModalOpen(false);
          setNewFolder('');
          setDescription('');
          refetch();
        },
        onError: () => {
          message.error('Không thể tạo thư mục mới!');
        },
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

  const handleEditFolder = (folder: Folder) => {
    let updatedName = folder.name;
    let updatedDescription = folder.description || '';

    Modal.confirm({
      title: 'Sửa thư mục',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Input
            defaultValue={folder.name}
            onChange={e => (updatedName = e.target.value)}
            placeholder="Tên thư mục"
          />
          <Input
            defaultValue={folder.description}
            onChange={e => (updatedDescription = e.target.value)}
            placeholder="Mô tả (không bắt buộc)"
          />
        </div>
      ),
      okText: 'Lưu',
      cancelText: 'Hủy',
      onOk: () => {
        if (!updatedName.trim()) {
          message.warning('Tên thư mục không được để trống!');
          return;
        }
        updateFolder(
          {
            resource: 'documents/folders',
            id: folder.id,
            values: {
              name: updatedName,
              description: updatedDescription,
            },
          },
          {
            onSuccess: () => {
              message.success(`Đã cập nhật thư mục "${updatedName}"`);
              refetch();
            },
            onError: (err: any) => {
              message.error(err?.response?.data?.message || 'Không thể cập nhật thư mục!');
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
          Thư Mục Đề Thi ({folders.length})
        </Typography.Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Input.Search
            placeholder="Tìm thư mục..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />

          <Button
            type="primary"
            icon={<IconPlus size={18} />}
            onClick={() => setIsModalOpen(true)}
            loading={creating}
            style={{
              borderRadius: 8,
              background: '#1890ff',
              border: 'none',
              fontWeight: 500,
              height: 32,
            }}
          />
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
                  onEdit={handleEditFolder}
                  onDelete={handleDeleteFolder}
                />
              ))}
            </Row>
          </div>
        )}
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
