import { useCreate, useInvalidate } from '@refinedev/core';
import { IconCategory, IconLink, IconList, IconPlus } from '@tabler/icons-react';
import { Button, Input, InputRef, message, Space, Tooltip, Typography } from 'antd';
import { useRef, useState } from 'react';
import ActivityLinks from './ActivityLinks';

interface ActivityLinkTabProps {
  activityId: string;
}

const ActivityLinkTab = ({ activityId }: ActivityLinkTabProps) => {
  const [showInput, setShowInput] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'category'>('category');
  const inputRef = useRef<InputRef>(null);

  const [link, setLink] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const invalidate = useInvalidate();
  const { mutate: addLink } = useCreate();

  const isRequiredFieldsFilled = (): boolean => {
    if (!showForm) {
      return !!link.trim();
    }
    return !!link.trim() && !!title.trim();
  };

  const handleAddLinks = () => {
    if (!showInput) {
      setShowInput(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleCancel = () => {
    setLink('');
    setTitle('');
    setDescription('');
    setShowInput(false);
    setShowForm(false);
  };

  const handleAddLink = () => {
    if (isRequiredFieldsFilled()) {
      addLink(
        {
          resource: `activities/${activityId}/links`,
          values: { link, title, description },
        },
        {
          onSuccess: () => {
            invalidate({
              resource: `activities/${activityId}/links`,
              invalidates: ['list'],
            });
            message.success('Thêm liên kết thành công');
          },
          onError: () => {
            message.error('Thêm liên kết thất bại');
          },
        },
      );
      handleCancel();
    }
  };
  console.log('id', activityId);

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);
    if (value.trim() && !showForm) {
      setShowForm(true);
    }
    if (!value.trim() && showForm) {
      setShowForm(false);
      setTitle('');
      setDescription('');
    }
  };

  const handleOuterBlur = () => {
    if (!link.trim() && !title.trim() && !description.trim()) {
      setShowInput(false);
      setShowForm(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px 8px 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Liên kết
        </Typography.Title>

        <Space style={{ gap: 2 }}>
          <Tooltip title="Thêm liên kết">
            <Button
              onClick={handleAddLinks}
              type="text"
              icon={<IconPlus size={16} stroke={1.5} color="#646464" />}
              style={{
                borderRadius: 8,
                background: showInput ? '#f0f0f0' : undefined,
              }}
            />
          </Tooltip>
          <Button
            onClick={() => setViewMode('category')}
            type="text"
            icon={<IconCategory size={16} stroke={1.5} color="#646464" />}
            style={{
              borderRadius: 8,
              background: viewMode === 'category' ? '#f0f0f0' : undefined,
            }}
          />
          <Button
            onClick={() => setViewMode('list')}
            type="text"
            icon={<IconList size={16} stroke={1.5} color="#646464" />}
            style={{
              borderRadius: 8,
              background: viewMode === 'list' ? '#f0f0f0' : undefined,
            }}
          />
        </Space>
      </div>

      <div
        style={{
          background: '#f7f7f7',
          flex: 1,
          zIndex: 1,
        }}
      >
        <ActivityLinks viewMode={viewMode} activityId={activityId} />
      </div>

      {showInput && (
        <div
          onBlur={handleOuterBlur}
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 49,
            left: 0,
            right: 0,
            background: '#fff',
            padding: 12,
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 5,
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <Input
            ref={inputRef}
            placeholder="Enter or paste a link..."
            value={link}
            onChange={handleLinkChange}
            style={{
              height: 36,
              fontSize: 14,
              marginBottom: showForm ? 12 : 0,
              borderRadius: 8,
            }}
            prefix={<IconLink size={16} color="#bfbfbf" />}
          />

          {showForm && (
            <div style={{ animation: 'slideDown 0.2s ease' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Tiêu đề <span style={{ color: '#f5222d' }}>*</span>
              </label>
              <Input
                placeholder="Nhập tiêu đề..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  marginBottom: 12,
                  height: 34,
                  fontSize: 13,
                  borderRadius: 6,
                }}
              />

              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Mô tả <span style={{ color: '#999' }}>(Tùy chọn)</span>
              </label>
              <Input.TextArea
                placeholder="Nhập mô tả..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                style={{
                  marginBottom: 14,
                  fontSize: 13,
                  resize: 'none',
                  borderRadius: 6,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button
                  onClick={handleCancel}
                  style={{
                    borderRadius: 8,
                    height: 36,
                    fontWeight: 500,
                    borderColor: '#d9d9d9',
                    color: '#555',
                  }}
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  onClick={handleAddLink}
                  disabled={!isRequiredFieldsFilled()}
                  style={{
                    background: '#1890ff',
                    borderColor: '#1890ff',
                    height: 36,
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  Thêm liên kết
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLinkTab;
