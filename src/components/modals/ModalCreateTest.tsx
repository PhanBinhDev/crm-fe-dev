import { IDocument } from '@/common/types/document';
import { useModal } from '@/hooks/useModal';
import { useCustomMutation } from '@refinedev/core';
import {
  IconArchive,
  IconCheck,
  IconChevronRight,
  IconFile,
  IconFileText,
  IconLink,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { Button, Divider, Form, Input, List, message, Modal, Popover, Space, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';

const STATUS_OPTIONS = [
  {
    label: 'Nháp',
    value: 'DRAFT',
    icon: <IconFileText size={15} color="#8c8c8c" />,
  },
  {
    label: 'Xuất bản',
    value: 'PUBLISHED',
    icon: <IconUpload size={15} color="#8c8c8c" />,
  },
  {
    label: 'Lưu trữ',
    value: 'ARCHIVED',
    icon: <IconArchive size={15} color="#8c8c8c" />,
  },
];

const TYPE_OPTIONS = [
  {
    label: 'File',
    value: 'FILE',
    icon: <IconFile size={15} color="#8c8c8c" />,
  },
  {
    label: 'Link',
    value: 'LINK',
    icon: <IconLink size={15} color="#8c8c8c" />,
  },
];

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

interface ModalCreateTestProps {
  onSuccess: () => void;
}

const ModalCreateTest = ({ onSuccess }: ModalCreateTestProps) => {
  const { data, closeModal } = useModal();
  const folderId = data?.folderId;
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [form] = Form.useForm<ExamFormValues>();
  const { mutate: createDocument, isPending } = useCustomMutation<IDocument>();

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
          closeModal();
          onSuccess?.();
          form.resetFields();
        },
        onError: () => {
          message.error('Tạo đề thi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Tạo đề thi mới</p>
          <Button
            type="text"
            style={{
              borderRadius: '100%',
              marginBottom: 2,
              background: '#0000000a',
            }}
            onClick={closeModal}
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
      open={true}
      onOk={() => form.submit()}
      onCancel={() => {
        closeModal();
        form.resetFields();
      }}
      okText={isPending ? 'Đang tạo...' : 'Tạo đề thi'}
      cancelText="Hủy"
      centered
      width={800}
      confirmLoading={isPending}
      closeIcon={null}
    >
      <Divider style={{ margin: '-8px 0 20px 0' }} />

      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left Column - Form Fields */}
          <div style={{ flex: 1 }}>
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              style={{
                marginBottom: 10,
                borderRight: '1px solid #f0f0f0',
                borderRadius: 6,
              }}
            >
              <TextArea
                placeholder="Nhập tên đề thi..."
                size="middle"
                variant="borderless"
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  border: '1px solid transparent',
                  paddingLeft: 4,
                  background: '#f8f8f8ff',
                }}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e6e6e6ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f8f8f8ff';
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              style={{
                marginBottom: 10,
                borderRight: '1px solid #f0f0f0',
                borderRadius: 6,
              }}
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea
                placeholder="Nhập mô tả..."
                variant="borderless"
                style={{
                  fontSize: 14,
                  border: '1px solid transparent',
                  background: '#f8f8f8ff',
                  paddingLeft: 4,
                }}
                autoSize={{ minRows: 3, maxRows: 5 }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e6e6e6ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f8f8f8ff';
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              />
            </Form.Item>

            <Form.Item
              name="metadata"
              style={{
                marginBottom: 10,
                borderRight: '1px solid #f0f0f0',
                borderRadius: 6,
              }}
              rules={[{ required: false }]}
            >
              <TextArea
                placeholder="Nhập metadata dạng Json (không bắt buộc)"
                variant="borderless"
                style={{
                  fontSize: 14,
                  border: '1px solid transparent',
                  background: '#f8f8f8ff',
                  paddingLeft: 4,
                }}
                autoSize={{ minRows: 2, maxRows: 5 }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e6e6e6ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f8f8f8ff';
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              />
            </Form.Item>
          </div>

          {/* Right Column - Upload/Link */}
          <div
            style={{
              flex: 1 / 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Space
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
              size={12}
            >
              <Form.Item
                name="type"
                rules={[{ required: true, message: 'Chọn loại!' }]}
                style={{ marginBottom: 0, flex: 1 }}
              >
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  onOpenChange={setTypeOpen}
                  styles={{ body: { padding: 5, width: 100 } }}
                  arrow={false}
                  open={typeOpen}
                  content={
                    <List
                      size="small"
                      dataSource={TYPE_OPTIONS}
                      renderItem={item => (
                        <List.Item
                          key={item.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            borderRadius: 6,
                            border: 'none',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => {
                            form.setFieldValue('type', item.value);
                            setTypeOpen(false);
                          }}
                        >
                          {item.icon}
                          <span style={{ flex: 1, userSelect: 'none' }}>{item.label}</span>
                          {form.getFieldValue('type') === item.value && <IconCheck size={14} />}
                        </List.Item>
                      )}
                    />
                  }
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      cursor: 'pointer',
                      border: '1px solid #e0e0e0ff',
                      borderRadius: 6,
                      padding: '0px 7px',
                      background: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#24292f',
                      height: 27,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setTypeOpen(!typeOpen)}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#646464',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        userSelect: 'none',
                      }}
                    >
                      {(() => {
                        const selected = TYPE_OPTIONS.find(
                          opt => opt.value === form.getFieldValue('type'),
                        );
                        return selected ? (
                          <>
                            {selected.icon}
                            {selected.label}
                          </>
                        ) : (
                          'Chọn loại'
                        );
                      })()}
                    </span>
                    <IconChevronRight
                      size={14}
                      style={{
                        transform: typeOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#8c8c8c',
                      }}
                    />
                  </div>
                </Popover>
              </Form.Item>

              <Form.Item
                name="status"
                rules={[{ required: true, message: 'Chọn trạng thái!' }]}
                style={{ marginBottom: 0, flex: 1 }}
              >
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  onOpenChange={setStatusOpen}
                  styles={{ body: { padding: 5, width: 135 } }}
                  arrow={false}
                  open={statusOpen}
                  content={
                    <List
                      size="small"
                      dataSource={STATUS_OPTIONS}
                      renderItem={item => (
                        <List.Item
                          key={item.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            borderRadius: 6,
                            border: 'none',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => {
                            form.setFieldValue('status', item.value);
                            setStatusOpen(false);
                          }}
                        >
                          {item.icon}
                          <span style={{ flex: 1, userSelect: 'none' }}>{item.label}</span>
                          {form.getFieldValue('status') === item.value && <IconCheck size={14} />}
                        </List.Item>
                      )}
                    />
                  }
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      cursor: 'pointer',
                      border: '1px solid #e0e0e0ff',
                      borderRadius: 6,
                      padding: '0px 7px',
                      background: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#24292f',
                      height: 27,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setStatusOpen(!statusOpen)}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#646464',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        userSelect: 'none',
                      }}
                    >
                      {(() => {
                        const selected = STATUS_OPTIONS.find(
                          opt => opt.value === form.getFieldValue('status'),
                        );
                        return selected ? (
                          <>
                            {selected.icon}
                            {selected.label}
                          </>
                        ) : (
                          'Chọn trạng thái'
                        );
                      })()}
                    </span>
                    <IconChevronRight
                      size={14}
                      style={{
                        transform: statusOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#8c8c8c',
                      }}
                    />
                  </div>
                </Popover>
              </Form.Item>
            </Space>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
            >
              {({ getFieldValue }) =>
                getFieldValue('type') === 'LINK' ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        background: '#f5f5f5',
                        borderRadius: 6,
                        textAlign: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <IconLink size={20} color="#1890ff" />
                      <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                        Nhập URL để liên kết đến tài liệu bên ngoài
                      </div>
                    </div>
                    <Form.Item
                      name="linkUrl"
                      rules={[
                        { required: true, message: 'Vui lòng nhập liên kết!' },
                        { type: 'url', message: 'liên kết không hợp lệ!' },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="https://example.com" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <Form.Item
                      name="file"
                      rules={[{ required: true, message: 'Vui lòng upload file!' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Upload.Dragger
                        multiple={false}
                        name="file"
                        beforeUpload={() => false}
                        maxCount={1}
                        style={{
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div>
                          <IconUpload size={20} color={'#1890ff'} />
                          <p
                            className="ant-upload-text"
                            style={{
                              fontSize: 15,
                              fontWeight: 500,
                            }}
                          >
                            Click hoặc kéo thả file vào đây
                          </p>
                          <p
                            className="ant-upload-hint"
                            style={{
                              fontSize: 11,
                              color: '#8c8c8c',
                              margin: 0,
                              lineHeight: 1.8,
                            }}
                          >
                            Hỗ trợ các định dạng:
                            <br /> PDF, DOC, DOCX, XLS, XLSX
                          </p>
                        </div>
                      </Upload.Dragger>
                    </Form.Item>
                  </div>
                )
              }
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalCreateTest;
