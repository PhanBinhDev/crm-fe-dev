import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconFolderFilled, IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Card, Col, Dropdown, Empty, Input, Modal, Row, Typography, message } from 'antd';
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

  const { data, isLoading, refetch } = useList<{ data: { folders: Folder[] } }>({
    resource: 'documents/folders',
  });
  const { mutate: createFolder, isLoading: creating } = useCreate();
  const { mutate: deleteFolder, isLoading: deleting } = useDelete();
  const { mutate: updateFolder, isLoading: updating } = useUpdate();

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
        padding: '32px 56px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
          Quản Lý Thư Mục Đề Thi
        </Typography.Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Input
            prefix={<IconSearch size={18} color="#9ca3af" />}
            placeholder="Search"
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
              padding: '0 18px',
              height: 40,
            }}
          >
            Tạo Mới Thư Mục
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 40 }}>
        <div>
          <Typography.Title
            level={5}
            style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}
          >
            Tất Cả Thư Mục
          </Typography.Title>

          {isLoading ? (
            <Typography.Text>Đang tải dữ liệu...</Typography.Text>
          ) : filteredFolders.length === 0 ? (
            <Empty description="Chưa có thư mục nào" />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredFolders.map(folder => (
                <Col key={folder.id} xs={24} sm={12} md={12} lg={8}>
                  <Card
                    onClick={() => navigate(`/exams/bank/${folder.id}`)}
                    style={{
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    bodyStyle={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '18px 16px',
                    }}
                  >
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'edit', label: 'Sửa' },
                          { key: 'delete', label: 'Xóa', danger: true },
                        ],
                        onClick: info => {
                          info.domEvent.stopPropagation();
                          const { key } = info;
                          if (key === 'edit') {
                            handleEditFolder(folder);
                          } else if (key === 'delete') {
                            handleDeleteFolder(folder.id, folder.name);
                          }
                        },
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        shape="circle"
                        icon={<span style={{ fontSize: 18 }}>⋮</span>}
                        onClick={e => e.stopPropagation()}
                        style={{ position: 'absolute', top: 4, right: 4, color: '#9ca3af' }}
                      />
                    </Dropdown>

                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: 'linear-gradient(180deg, #60a5fa, #3b82f6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconFolderFilled size={32} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography.Text
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#111827',
                          display: 'block',
                        }}
                      >
                        {folder.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        1,245 files • 688.4 MB
                      </Typography.Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
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
