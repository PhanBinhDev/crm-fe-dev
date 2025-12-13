import { IDocument } from '@/common/types/document';
import { useModal } from '@/hooks/useModal';
import { useUpdate } from '@refinedev/core';
import { IconX } from '@tabler/icons-react';
import { Button, Divider, Input, message, Modal } from 'antd';
import { useEffect, useState } from 'react';

interface ModalEditDocumentProps {
  document: IDocument;
  onSuccess?: () => void;
}

export default function ModalEditDocument({ document, onSuccess }: ModalEditDocumentProps) {
  const { isOpen, type, closeModal } = useModal();
  const { mutate: updateDocument, isLoading } = useUpdate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const isModalOpen = isOpen && type === 'ModalEditDocument';

  useEffect(() => {
    if (isModalOpen && document) {
      setTitle(document.title);
      setDescription(document.description || '');
    }
  }, [isModalOpen, document]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error('Vui lòng nhập tiêu đề đề thi');
      return;
    }

    if (title.length > 200) {
      message.error('Tiêu đề không được vượt quá 200 ký tự');
      return;
    }

    if (description.length > 500) {
      message.error('Mô tả không được vượt quá 500 ký tự');
      return;
    }

    updateDocument(
      {
        resource: 'documents',
        id: document.id,
        values: {
          title: title.trim(),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật đề thi thành công');
          closeModal();
          setTitle('');
          setDescription('');
          onSuccess?.();
        },
        onError: () => {
          message.error('Cập nhật đề thi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };

  const handleCancel = () => {
    closeModal();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      width={600}
      destroyOnClose
      closeIcon={null}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Cập nhật đề thi
            </h2>
            <p
              style={{
                fontSize: 13,
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Cập nhật tên và mô tả cho đề thi hiện tại.
            </p>
          </div>

          <Button
            type="text"
            style={{
              borderRadius: '100%',
              marginBottom: 2,
              background: '#0000000a',
            }}
            onClick={handleCancel}
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
            Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            placeholder="Nhập tiêu đề đề thi..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onPressEnter={handleSubmit}
            maxLength={200}
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
            maxLength={500}
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
        <Button onClick={handleCancel}>Hủy</Button>
        <Button type="primary" onClick={handleSubmit} loading={isLoading}>
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  );
}
