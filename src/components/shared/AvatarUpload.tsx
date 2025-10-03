import { IFileUploadResponse } from '@/common/types/file';
import { useCustomMutation } from '@refinedev/core';
import { IconUpload, IconUser, IconX } from '@tabler/icons-react';
import type { UploadProps } from 'antd';
import { Avatar, Upload, message } from 'antd';
import React, { useCallback, useState } from 'react';

interface AvatarUploadProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  size?: number;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AvatarUpload: React.FC<AvatarUploadProps> = ({ value, onChange, size = 36 }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(value || '');
  const [hovered, setHovered] = useState(false);

  const { mutate: uploadFile, isPending: uploading } = useCustomMutation<IFileUploadResponse>();

  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file hình ảnh!');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      message.error('Kích thước file phải nhỏ hơn 2MB!');
      return false;
    }

    return true;
  }, []);

  const handleUpload = useCallback(
    async (options: any) => {
      const { file, onSuccess, onError } = options;

      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      const formData = new FormData();
      formData.append('file', file);

      uploadFile(
        {
          url: '/upload/file',
          method: 'post',
          values: formData,
          config: {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        },
        {
          onSuccess: res => {
            const filePath = res.data.url;
            const fullUrl = `${API_BASE_URL}${filePath}`;

            // Cleanup preview URL
            URL.revokeObjectURL(previewUrl);

            setAvatarUrl(fullUrl);
            onChange?.(filePath);
            onSuccess?.(res.data, file);
          },
          onError: error => {
            console.error('Upload error:', error);

            // Cleanup on error
            URL.revokeObjectURL(previewUrl);
            setAvatarUrl(value || '');

            onChange?.(null);
            onError?.(error);
            message.error('Tải ảnh lên thất bại!');
          },
        },
      );
    },
    [uploadFile, onChange, value],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setAvatarUrl('');
      onChange?.(null);
    },
    [onChange],
  );

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: validateFile,
    customRequest: handleUpload,
    maxCount: 1,
    disabled: uploading,
  };

  return (
    <div
      className="avatar-upload-wrapper"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar
        size={size}
        src={avatarUrl}
        icon={<IconUser size={size / 2} />}
        style={{
          border: '1px solid #e0e0e0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      />

      {/* Hover overlay with upload */}
      {hovered && (
        <Upload {...uploadProps}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <IconUpload
              size={size / 2.5}
              color="white"
              style={{
                opacity: uploading ? 0.5 : 1,
                transition: 'opacity 0.2s ease',
              }}
            />
          </div>
        </Upload>
      )}

      {/* Remove button */}
      {avatarUrl && hovered && (
        <div
          onClick={handleRemove}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            backgroundColor: '#ff4d4f',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconX size={12} color="white" />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
