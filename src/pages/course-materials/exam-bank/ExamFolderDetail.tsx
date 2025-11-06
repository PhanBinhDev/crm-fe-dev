import { IDocument, IFolder } from '@/common/types/document';
import { InboxOutlined, MoreOutlined } from '@ant-design/icons';
import { useCustomMutation, useDelete, useOne } from '@refinedev/core';
import { IconUpload } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popover,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface ExamFormValues {
  title: string;
  description: string;
  type: 'FILE' | 'LINK';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  linkUrl?: string;
  file?: any;
  metadata?: Record<string, any>;
  folderId: string;
}

export default function ExamFolderDetail() {
  const { folderId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localFolderData, setLocalFolderData] = useState<IFolder | null>(null);
  // const [documentInfo, setDocumentInfo] = useState<IDocument | null>(null);

  const [form] = Form.useForm<ExamFormValues>();

  const {
    data: folderData,
    isLoading,
    refetch,
  } = useOne<IFolder>({
    resource: `documents/folders/${folderId}`,
    id: '',
  });

  const { mutate: createDocument, isPending } = useCustomMutation<IDocument>();

  const { mutate: deleteDocument } = useDelete();

  useEffect(() => {
    if (folderData?.data) {
      setLocalFolderData(folderData.data);
    }
  }, [folderData]);

  // useEffect(() => {
  //   if (folderData?.data) {
  //     setDocumentInfo(folderData.data.documents[0]);
  //   }
  // }, [folderData]);

  if (isLoading) {
    return (
      <Skeleton active paragraph={{ rows: 4 }} style={{ padding: 20 }} title={{ width: '60%' }} />
    );
  }

  const handleFormSubmit = (values: ExamFormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('type', values.type);
    formData.append('status', values.status);
    formData.append('folderId', folderId || '');

    if (values.type === 'FILE' && values.file?.file) {
      formData.append('file', values.file.file);
    }

    if (values.type === 'LINK' && values.linkUrl) {
      formData.append('linkUrl', values.linkUrl);
    }

    if (values.metadata) {
      formData.append('metadata', JSON.stringify(JSON.parse(values.metadata as unknown as string)));
    }

    const newDocument = formData;

    createDocument(
      {
        url: 'documents',
        method: 'post',
        values: newDocument,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: () => {
          message.success('Tạo đề thi thành công');
          setIsModalOpen(false);
          refetch();
          form.resetFields();
        },
        onError: () => {
          message.error('Tạo đề thi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };

  const handleDeleteDocument = (documentId: string) => {
    const prevLocalFolderData = localFolderData;

    setLocalFolderData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId),
      };
    });

    deleteDocument(
      {
        resource: `documents/${documentId}`,
        id: '',
      },
      {
        onSuccess: () => {
          message.success('Xóa đề thi thành công');
          refetch();
        },
        onError: () => {
          setLocalFolderData(prevLocalFolderData);
          message.error('Xóa đề thi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };

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
          <Typography.Title level={4}>{localFolderData?.name}</Typography.Title>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<IconUpload size={16} />}
          >
            Upload đề thi
          </Button>
        </div>
        <Input.Search placeholder="Tìm kiếm đề thi..." style={{ marginBottom: 16 }} />
        <Table
          dataSource={localFolderData?.documents}
          columns={[
            {
              title: 'Tên đề thi',
              dataIndex: 'title',
              key: 'title',
            },
            {
              title: 'Ngày đăng',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (createdAt: string) => <span>{dayjs(createdAt).format('DD/MM/YYYY')}</span>,
            },
            {
              title: 'Người đăng',
              dataIndex: ['createdBy', 'name'],
              key: 'createdBy',
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
                  {status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                </Tag>
              ),
            },
            {
              key: 'actions',
              width: 50,
              render: (_, record: IDocument) => (
                <Popover
                  content={
                    <Space direction="vertical">
                      <Link
                        to={
                          record.type === 'FILE'
                            ? (record.file?.url ?? '#')
                            : (record.linkUrl ?? '#')
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem chi tiết
                      </Link>
                      <Typography.Text
                        type="danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Xác nhận xóa',
                            content: 'Bạn có chắc chắn muốn xóa đề thi này?',
                            okText: 'Xóa',
                            cancelText: 'Hủy',
                            okButtonProps: { danger: true },
                            onOk: () => handleDeleteDocument(record.id),
                          });
                        }}
                      >
                        Xóa
                      </Typography.Text>
                    </Space>
                  }
                  trigger="click"
                  placement="left"
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Popover>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Right panel */}
      {/* <div style={{ flex: 1 }}>
        <Card title="Thông tin đề thi" bordered>
          {documentInfo ? (
            <>
              <Typography.Paragraph>
                <strong>Tên đề thi:</strong> {documentInfo.title}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>Người upload:</strong> {documentInfo.createdBy.name}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>Ngày upload:</strong> {documentInfo.createdAt}
              </Typography.Paragraph>
              {documentInfo?.type === 'FILE' ? (
                <Typography.Paragraph>
                  <strong>Kích thước:</strong> {documentInfo.file?.size} KB
                </Typography.Paragraph>
              ) : (
                <Typography.Paragraph>
                  <strong>URL:</strong> {documentInfo.linkUrl}
                </Typography.Paragraph>
              )}

              <Typography.Paragraph>
                <strong>Loại:</strong> {documentInfo?.type === 'FILE' ? 'File' : 'Link'}
              </Typography.Paragraph>
            </>
          ) : (
            <Typography.Text>Hiện chưa có đề thi nào.</Typography.Text>
          )}
        </Card>
      </div> */}

      <Modal
        title="Tạo đề thi mới"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={isPending ? 'Đang tạo...' : 'Tạo đề thi'}
        cancelText="Hủy"
        centered
        width={600}
        confirmLoading={isPending}
        okButtonProps={{ disabled: isPending }}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề đề thi"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tên đề thi..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả đề thi">
            <Input.TextArea rows={3} placeholder="Nhập mô tả..." />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="type"
              label="Loại đề thi"
              rules={[{ required: true, message: 'Vui lòng chọn loại đề thi!' }]}
            >
              <Select
                defaultValue=""
                style={{ width: 160 }}
                options={[
                  { label: 'Chọn loại đề thi', value: '' },
                  { label: 'File', value: 'FILE' },
                  { label: 'Link', value: 'LINK' },
                ]}
              />
            </Form.Item>

            <Form.Item
              style={{ flex: 1, justifyItems: 'flex-start' }}
              name="status"
              label="Trạng thái đề thi"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select
                defaultValue=""
                style={{ width: 160 }}
                options={[
                  { label: 'Chọn trạng thái', value: '' },
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'LINK' ? (
                <Form.Item
                  name="linkUrl"
                  label="URL link"
                  rules={[
                    { required: true, message: 'Vui lòng nhập URL!' },
                    { type: 'url', message: 'Vui lòng nhập URL hợp lệ!' },
                  ]}
                >
                  <Input />
                </Form.Item>
              ) : (
                <Form.Item
                  name="file"
                  label="File đề thi"
                  rules={[{ required: true, message: 'Vui lòng upload file!' }]}
                >
                  <Upload.Dragger
                    multiple={false}
                    name="file"
                    beforeUpload={() => false}
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click hoặc kéo thả file vào đây</p>
                  </Upload.Dragger>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item name="metadata" label="Metadata bổ sung">
            <Input.TextArea rows={2} placeholder="Nhập metadata dạng JSON (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
