import { IconUpload, IconUser } from '@tabler/icons-react';
import { Avatar, Upload, UploadFile, UploadProps, message } from 'antd';
import { UploadRequestOption } from 'antd/lib/upload/interface';
import React, { useState } from 'react';
import { useCustomMutation } from '@refinedev/core';
import { IFileUploadResponse } from '@/common/types/file';

interface AvatarUploadProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ value, onChange, size = 36 }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [hovered, setHovered] = useState(false);

  const { mutate: uploadFile } = useCustomMutation<IFileUploadResponse>();

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file hình ảnh!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước file phải nhỏ hơn 2MB!');
      return false;
    }

    return true;
  };

  const handleAvatarUpload = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    // Hiện preview ngay lập tức
    const previewUrl = URL.createObjectURL(file as Blob);
    setAvatarUrl(previewUrl);

    const formData = new FormData();
    formData.append('file', file as Blob);

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
          console.log('Full upload response:', res);
          console.log('Upload response data:', res.data);
          
          // API upload trả về path, không phải URL đầy đủ
          const filePath = res.data.url || res.data.path;
          
          console.log('Upload success - file path:', filePath);
          
          // Hiển thị preview với URL đầy đủ
          const previewUrl = `${import.meta.env.VITE_API_BASE_URL}${filePath}`;
          setAvatarUrl(previewUrl);
          
          // Gửi path cho parent component
          onChange?.(filePath);
          onSuccess?.(res.data, file as any);
          setUploading(false);
        },
        onError: error => {
          console.error('Upload error:', error);
          setUploading(false);
          // Xóa preview nếu upload thất bại
          setAvatarUrl('');
          onChange?.(null);
          onError?.(error as any);
          message.error('Tải ảnh lên thất bại!');
        },
      },
    );
  };

  const handleChange: UploadProps['onChange'] = info => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Avatar URL đã được set trong handleAvatarUpload, không cần set lại ở đây
      setUploading(false);
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại!');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setAvatarUrl('');
    setFileList([]);
    onChange?.(null);
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          transition: 'all 0.2s ease'
        }}
      />
      
      {/* Upload overlay */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Upload
            name="avatar"
            listType="text"
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={beforeUpload}
            customRequest={handleAvatarUpload}
            maxCount={1}
            showUploadList={false}
          >
            <IconUpload 
              size={16} 
              color="white"
              style={{ 
                opacity: uploading ? 0.5 : 1,
                transition: 'opacity 0.2s ease'
              }}
            />
          </Upload>
        </div>
      )}
      
      {/* Remove button when avatar exists */}
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
            fontSize: 12,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          ×
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
