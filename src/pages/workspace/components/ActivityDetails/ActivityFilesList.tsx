import Spinner from '@/components/ui/Spinner';
import { getFileIcon } from '@/utils/activity';
import { IconDownload } from '@tabler/icons-react';
import { Button, Card, Tooltip, Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface ActivityFile {
  url: string;
}

interface ActivityFilesListProps {
  files: ActivityFile[];
  loading?: boolean;
}

const ActivityFilesList = ({ files, loading }: ActivityFilesListProps) => {
  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          color: '#999',
          borderRadius: 8,
          background: '#f0f0f0',
        }}
      >
        <Spinner size={24} />
      </div>
    );
  }

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
        <Typography.Text>Chưa có tệp đính kèm</Typography.Text>
        <Button type="text">Tải lên</Button>
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
            }}
            styles={{
              body: { display: 'flex', gap: 12, padding: 12 },
            }}
            onClick={() => {
              // Mở file để xem trực tiếp
              window.open(file.url, '_blank');
            }}
          >
            <div style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>
              {getFileIcon(fileName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Paragraph
                strong
                ellipsis={{ rows: 1 }}
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
                    // Download file
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
    </div>
  );
};

export default ActivityFilesList;
