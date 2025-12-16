import { ActivityFile } from '@/common/types';
import FileAttachments from '@/pages/workspace/components/FileAttachments';
import { getFileIcon } from '@/utils/activity';
import { UploadOutlined } from '@ant-design/icons';
import { useCustomMutation } from '@refinedev/core';
import { IconDownload } from '@tabler/icons-react';
import { Button, Card, Form, Tooltip, Typography } from 'antd';
import { useCallback, useState } from 'react';

const { Text, Paragraph } = Typography;

interface ActivityFilesListProps {
  files: ActivityFile[];
  onUploadFileSuccess: (files: ActivityFile[]) => void;
  loading?: boolean;
}

const ActivityFilesList = ({ files, onUploadFileSuccess }: ActivityFilesListProps) => {
  const { mutate: uploadFiles, isPending } = useCustomMutation();

  const [form] = Form.useForm();
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachmentsChange = useCallback(
    (files: File[]) => {
      setAttachments(files);
      form.setFieldValue('attachments', files);
    },
    [form],
  );

  const handleUploadfile = async () => {
    let fileUrls: ActivityFile[] = [];
    if (attachments.length > 0) {
      try {
        const formData = new FormData();
        attachments.forEach(file => formData.append('files', file));

        const uploadResult = await new Promise<any>((resolve, reject) => {
          uploadFiles(
            {
              url: '/upload/multi',
              method: 'post',
              values: formData,
              config: {
                headers: { 'Content-Type': 'multipart/form-data' },
              },
            },
            {
              onSuccess: res => {
                setAttachments([]);
                return resolve(res);
              },
              onError: error => {
                return reject(error);
              },
            },
          );
        });

        if (uploadResult?.data) {
          uploadResult?.data.map((file: { status: string; url: string }) =>
            fileUrls.push({ url: file.url }),
          );
        } else {
          return;
        }

        if (fileUrls.length > 0) {
          onUploadFileSuccess(fileUrls);
        }
      } catch (uploadError) {
        return;
      }
    }
  };

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          color: '#999',
          borderRadius: 8,
          background: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            maxWidth: '310px',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            justifyContent: 'center',
          }}
        >
          <Typography.Text>Chưa có tệp đính kèm</Typography.Text>
          <FileAttachments title="" value={attachments} onChange={handleAttachmentsChange} />
          {attachments.length > 0 && (
            <Button onClick={handleUploadfile} loading={isPending} icon={<UploadOutlined />}>
              Tải lên
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 8,
        maxHeight: 'calc(90vh - 97px)',
        overflowY: 'auto',
      }}
    >
      {files.map((file, index) => {
        const fileName = file.url.split('/').pop() || `file-${index}`;
        return (
          <Card
            key={index}
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f0f0f0',
              cursor: 'pointer',
              maxWidth: '310px',
            }}
            styles={{
              body: { display: 'flex', gap: 12, padding: 12 },
            }}
            onClick={() => {
              // Mở file để xem trực tiếp
              window.open(`${import.meta.env.VITE_API_BASE_URL}${file.url}`, '_blank');
            }}
          >
            <div style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>
              {getFileIcon(fileName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Paragraph
                strong
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 4, fontSize: 13, lineHeight: 1.2 }}
              >
                {fileName}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {file.url}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Tải xuống">
                <Button
                  type="text"
                  size="small"
                  icon={<IconDownload size={14} />}
                  style={{ color: '#838383' }}
                  styles={{
                    icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = file.url;
                    link.download = fileName;
                    link.click();
                  }}
                />
              </Tooltip>
            </div>
          </Card>
        );
      })}

      <div
        style={{
          maxWidth: '310px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          justifyContent: 'center',
        }}
      >
        <FileAttachments title="" value={attachments} onChange={handleAttachmentsChange} />
        {attachments.length > 0 && (
          <Button onClick={handleUploadfile} loading={isPending} icon={<UploadOutlined />}>
            Tải lên
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActivityFilesList;
