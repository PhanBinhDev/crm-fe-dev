import { IconFileText, IconUpload } from '@tabler/icons-react';
import { Button, Card, Input, List, Typography, Upload } from 'antd';
import { useParams } from 'react-router-dom';

export default function ExamFolderDetail() {
  const { folderId } = useParams();
  const folderName =
    folderId === 'math'
      ? 'Toán học'
      : folderId === 'physics'
        ? 'Vật lý'
        : folderId === 'english'
          ? 'Anh văn'
          : 'Thư mục mới';

  const mockFiles = [
    {
      id: 1,
      name: 'Đề kiểm tra Chương 1.pdf',
      date: '10/10/2024',
      uploader: 'Nguyễn Văn A',
      size: '324KB',
      type: 'PDF',
    },
    {
      id: 2,
      name: 'Đề thi học kỳ.pdf',
      date: '05/10/2024',
      uploader: 'Trần Thị B',
      size: '412KB',
      type: 'PDF',
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', padding: 20, gap: 20 }}>
      {/* Left panel */}
      <div style={{ flex: 2 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Typography.Title level={4}>{folderName}</Typography.Title>
          <Upload showUploadList={false}>
            <Button type="primary" icon={<IconUpload size={16} />}>
              Upload file
            </Button>
          </Upload>
        </div>

        <Input.Search placeholder="Tìm kiếm tài liệu..." style={{ marginBottom: 16 }} />

        <List
          bordered
          dataSource={mockFiles}
          renderItem={item => (
            <List.Item
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconFileText size={20} color="#1677ff" />
                <Typography.Text>{item.name}</Typography.Text>
              </div>
              <Typography.Text type="secondary">{item.date}</Typography.Text>
            </List.Item>
          )}
        />
      </div>

      {/* Right panel */}
      <div style={{ flex: 1 }}>
        <Card title="Thông tin tài liệu" bordered>
          <Typography.Paragraph>
            <strong>Tên file:</strong> Đề kiểm tra Chương 1.pdf
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Người upload:</strong> Nguyễn Văn A
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Ngày upload:</strong> 10/10/2024
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Kích thước:</strong> 324KB
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Loại:</strong> PDF
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
