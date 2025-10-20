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

  const [url, setUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const invalidate = useInvalidate();
  const { mutate: addLink } = useCreate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRequiredFieldsFilled = (): boolean => {
    if (!showForm) {
      return !!url.trim();
    }
    return !!url.trim() && !!title.trim();
  };

  const isValidUrl = (value: string): boolean => {
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
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
    setUrl('');
    setTitle('');
    setDescription('');
    setShowInput(false);
    setShowForm(false);
  };

  const handleAddLink = () => {
    if (isRequiredFieldsFilled()) {
      if (!isValidUrl(url)) {
        message.error('Đường dẫn không hợp lệ. Vui lòng nhập URL hợp lệ (http hoặc https).');
        return;
      }
      setIsSubmitting(true);
      console.log(title, url, description);
      addLink(
        {
          resource: `activities/${activityId}/links`,
          values: { title, url, description },
        },
        {
          onSuccess: () => {
            setIsSubmitting(false);
            invalidate({
              resource: `activities/${activityId}/links`,
              invalidates: ['list'],
            });
            handleCancel();
          },
          onError: () => {
            setIsSubmitting(false);
          },
        },
      );
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
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
    if (!url.trim() && !title.trim() && !description.trim()) {
      setShowInput(false);
      setShowForm(false);
    }
  };

  const ViewModeToggle = ({
    viewMode,
    setViewMode,
  }: {
    viewMode: 'category' | 'list';
    setViewMode: React.Dispatch<React.SetStateAction<'category' | 'list'>>;
  }) => {
    const toggleView = () => {
      setViewMode(prev => (prev === 'category' ? 'list' : 'category'));
    };

    return (
      <Tooltip
        title={viewMode === 'category' ? 'Chuyển sang dạng danh sách' : 'Chuyển sang dạng danh mục'}
      >
        <Button
          onClick={toggleView}
          type="text"
          icon={
            viewMode === 'category' ? (
              <IconCategory size={16} stroke={1.5} color="#646464" />
            ) : (
              <IconList size={16} stroke={1.5} color="#646464" />
            )
          }
          style={{
            borderRadius: 8,
            background: '#f0f0f0',
          }}
        />
      </Tooltip>
    );
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
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
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
            value={url}
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
                onPressEnter={e => {
                  e.stopPropagation();
                  handleAddLink();
                }}
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
                  loading={isSubmitting}
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
