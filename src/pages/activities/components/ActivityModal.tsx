import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Upload, Button, DatePicker } from 'antd';
import { useCreate, useList } from '@refinedev/core';
import { CloseOutlined, UploadOutlined } from '@ant-design/icons';
const { Title } = Typography;

const { Option } = Select;

interface ActivityModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  stageId?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  stageId,
}) => {
  const [form] = Form.useForm();

  const { mutate: createActivity, isLoading } = useCreate();

  // Fetch stages for selection
  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const stages = stagesData?.data || [];

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const activityData = {
        ...values,
        stageId: stageId || values.stageId,
        status: 'new',
      };

      createActivity(
        {
          resource: 'activities',
          values: activityData,
        },
        {
          onSuccess: () => {
            form.resetFields();
            onSuccess();
          },
        },
      );
    });
  };

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      if (stageId) {
        form.setFieldsValue({ stageId });
      }
    }
  }, [visible, stageId, form]);

  return (
    <>
      <Modal
        open={visible}
        onCancel={onCancel}
        onOk={handleSubmit}
        confirmLoading={isLoading}
        width={1000}
        style={{ top: 20 }}
        styles={{
          body: {
            padding: 0,
            background: '#ffffff',
          },
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 8,
          }}
        >
          <Form form={form} layout="vertical">
            <div
              style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid #e6e9ef',
              }}
            >
              <Title
                level={3}
                style={{
                  color: '#202020',
                  fontWeight: 600,
                  fontSize: '18px',
                  margin: 0,
                }}
              >
                Tạo công việc mới
              </Title>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 20 }}>
                <Form.Item name="title" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="Tên công việc"
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      border: 'none',
                      padding: '8px 0',
                      background: 'transparent',
                      boxShadow: 'none',
                      color: '#202020',
                    }}
                  />
                </Form.Item>
                <div
                  style={{
                    height: '1px',
                    background: '#e6e9ef',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: 20,
                  padding: '16px',
                  borderRadius: 8,
                  background: '#fafbfc',
                  border: '1px solid #e6e9ef',
                }}
              >
                <Row gutter={[0, 12]}>
                  <Col span={24}>
                    <Row gutter={24}>
                      {!stageId && (
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                            <div
                              style={{
                                width: '100px',
                                fontSize: '13px',
                                color: '#202020',
                                fontWeight: 500,
                                letterSpacing: '0.3px',
                              }}
                            >
                              Trạng thái
                            </div>
                            <Form.Item name="stageId" style={{ margin: 0, flex: 1 }}>
                              <Select
                                placeholder="Chọn trạng thái"
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                              >
                                {stages.map(stage => (
                                  <Option key={stage.id} value={stage.id}>
                                    {stage.title}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        </Col>
                      )}

                      <Col span={stageId ? 24 : 12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Đảm nhiệm
                          </div>
                          <Form.Item name="assignees" style={{ margin: 0, flex: 1 }}>
                            <Select
                              mode="multiple"
                              placeholder="Thêm người đảm nhiệm"
                              style={{ width: '100%' }}
                              variant="borderless"
                              size="small"
                              maxTagCount={3}
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Ưu tiên
                          </div>
                          <Form.Item name="priority" style={{ margin: 0, flex: 1 }}>
                            <Select
                              placeholder="Chọn mức độ ưu tiên"
                              style={{ width: '100%' }}
                              variant="borderless"
                              size="small"
                              options={[
                                { label: '🔴 Urgent', value: 'urgent' },
                                { label: '🟡 High', value: 'high' },
                                { label: '🔵 Normal', value: 'medium' },
                                { label: '⚪ Low', value: 'low' },
                              ]}
                            />
                          </Form.Item>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,
                              letterSpacing: '0.3px',
                            }}
                          >
                            Ước lượng
                          </div>
                          <Form.Item name="estimate" style={{ margin: 0, flex: 1 }}>
                            <Input
                              placeholder="Ước lượng thời gian thực hiện"
                              variant="borderless"
                              size="small"
                              suffix={
                                <span style={{ color: '#202020', fontSize: '12px' }}>phút</span>
                              }
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Ngày bắt đầu
                          </div>
                          <Form.Item name="startTime" style={{ margin: 0, flex: 1 }}>
                            <DatePicker
                              showTime
                              placeholder="Chọn ngày bắt đầu"
                              style={{ width: '100%' }}
                              variant="borderless"
                              size="small"
                            />
                          </Form.Item>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Ngày kết thúc
                          </div>
                          <Form.Item name="endTime" style={{ margin: 0, flex: 1 }}>
                            <DatePicker
                              showTime
                              placeholder="Chọn ngày kết thúc"
                              style={{ width: '100%' }}
                              variant="borderless"
                              size="small"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Kỳ học
                          </div>
                          <Form.Item name="semester" style={{ margin: 0, flex: 1 }}>
                            <Select
                              placeholder="Chọn kỳ học "
                              style={{ width: '100%' }}
                              variant="borderless"
                              size="small"
                            />
                          </Form.Item>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '100px',
                              fontSize: '13px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                            }}
                          >
                            Liên kết
                          </div>
                          <Form.Item name="link" style={{ margin: 0, flex: 1 }}>
                            <Input
                              placeholder="Dán một liên kết"
                              variant="borderless"
                              size="small"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>

              {/* Description & Attachments */}
              <div style={{ marginBottom: 20 }}>
                <Row gutter={24} align="stretch">
                  {/* Description */}
                  <Col flex="3">
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#202020',
                          fontWeight: 500,

                          letterSpacing: '0.3px',
                          marginBottom: 8,
                        }}
                      >
                        Mô tả
                      </div>
                      <Form.Item name="description" style={{ marginBottom: 0, flex: 1 }}>
                        <Input.TextArea
                          rows={4}
                          placeholder="Mô tả chi tiết công việc"
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.5',
                            border: '1px solid #e6e9ef',
                            borderRadius: 6,
                            height: '100px',
                          }}
                        />
                      </Form.Item>
                    </div>
                  </Col>

                  {/* Attachments */}
                  <Col flex="1">
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#202020',
                          fontWeight: 500,

                          letterSpacing: '0.3px',
                          marginBottom: 8,
                        }}
                      >
                        File tài liệu
                      </div>
                      <Form.Item
                        name="file"
                        valuePropName="file"
                        getValueFromEvent={e => {
                          if (Array.isArray(e)) return e;
                          return e?.file?.response?.url || e?.file?.url;
                        }}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Upload
                          name="file"
                          action="https://api.example.com/upload"
                          listType="text"
                          maxCount={1}
                        >
                          <div
                            style={{
                              border: '1px dashed #d1d5db',
                              borderRadius: 6,
                              padding: '16px',
                              textAlign: 'center',
                              background: '#fafbfc',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              height: '100px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '200px',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#7c3aed';
                              e.currentTarget.style.background = '#f3f4f6';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.background = '#fafbfc';
                            }}
                          >
                            <UploadOutlined
                              style={{
                                fontSize: 20,
                                color: '#202020',
                                marginBottom: 4,
                              }}
                            />
                            <div
                              style={{ fontSize: '12px', color: '#202020', textAlign: 'center' }}
                            >
                              Kéo thả hoặc{' '}
                              <span style={{ color: '#7c3aed', fontWeight: 500 }}>
                                tải lên file
                              </span>
                            </div>
                          </div>
                        </Upload>
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Subtask */}
              <div style={{ marginBottom: 20 }}>
                <Form.List name="subtasks">
                  {(fields, { add, remove }) => (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: fields.length > 0 ? 12 : 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#202020',
                            fontWeight: 500,

                            letterSpacing: '0.3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          Nhiệm vụ con
                          {fields.length > 0 && (
                            <span
                              style={{
                                background: '#e6e9ef',
                                color: '#4a5568',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '10px',
                                minWidth: '18px',
                                textAlign: 'center',
                              }}
                            >
                              {fields.length}
                            </span>
                          )}
                        </div>
                        <Button
                          type="text"
                          size="small"
                          onClick={() =>
                            add({
                              title: '',
                              assignee: null,
                              priority: 'medium',
                              endDate: '',
                            })
                          }
                          style={{
                            color: '#7c3aed',
                            fontSize: '12px',
                            fontWeight: 500,
                            height: '24px',
                            padding: '0 8px',
                          }}
                        >
                          + Tạo nhiệm vụ con
                        </Button>
                      </div>

                      {fields.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 100px 120px 32px',
                            gap: '12px',
                            padding: '8px 12px',
                            background: '#f8f9fa',
                            borderRadius: '4px 4px 0 0',
                            fontSize: '11px',
                            color: '#202020',
                            fontWeight: 600,
                            letterSpacing: '0.3px',
                          }}
                        >
                          <div>Tên công việc</div>
                          <div>Đảm nhiệm</div>
                          <div>Ưu tiên</div>
                          <div>Ngày kết thúc</div>
                          <div></div>
                        </div>
                      )}

                      {fields.map(({ key, name }, index) => (
                        <div
                          key={key}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 100px 120px 32px',
                            gap: '12px',
                            padding: '8px 12px',
                            alignItems: 'center',
                            background: '#ffffff',
                            borderLeft: '1px solid #e6e9ef',
                            borderRight: '1px solid #e6e9ef',
                            borderBottom:
                              index === fields.length - 1
                                ? '1px solid #e6e9ef'
                                : '1px solid #f1f3f4',
                            fontSize: '13px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: '14px',
                                height: '14px',
                                border: '1.5px solid #d1d5db',
                                borderRadius: '2px',
                                flexShrink: 0,
                              }}
                            />
                            <Form.Item name={[name, 'title']} style={{ margin: 0, flex: 1 }}>
                              <Input
                                placeholder="Tên công việc"
                                variant="borderless"
                                size="small"
                                style={{ fontSize: '13px' }}
                              />
                            </Form.Item>
                          </div>

                          <Form.Item name={[name, 'assignee']} style={{ margin: 0 }}>
                            <Select
                              placeholder="Đảm nhiệm"
                              variant="borderless"
                              size="small"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Item>

                          <Form.Item name={[name, 'priority']} style={{ margin: 0 }}>
                            <Select
                              placeholder="Ưu tiên"
                              variant="borderless"
                              size="small"
                              style={{ fontSize: '13px' }}
                              options={[
                                { label: '🔴', value: 'urgent' },
                                { label: '🟡', value: 'high' },
                                { label: '🔵', value: 'medium' },
                                { label: '⚪', value: 'low' },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item name={[name, 'endDate']} style={{ margin: 0 }}>
                            <Input
                              type="date"
                              variant="borderless"
                              size="small"
                              style={{ fontSize: '12px' }}
                            />
                          </Form.Item>

                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => remove(name)}
                            style={{
                              width: '24px',
                              height: '24px',
                              minWidth: '24px',
                              color: '#dc2626',
                              fontSize: '10px',
                            }}
                          />
                        </div>
                      ))}

                      {fields.length === 0 && (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: '#9ca3af',
                            fontSize: '13px',
                            background: '#fafbfc',
                            borderRadius: 4,
                            border: '1px dashed #e6e9ef',
                          }}
                        >
                          Chưa có nhiệm vụ nào
                        </div>
                      )}
                    </>
                  )}
                </Form.List>
              </div>

              {/* Checklist */}
              <div>
                <Form.List name="checklist">
                  {(fields, { add, remove }) => (
                    <>
                      {/* Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: fields.length > 0 ? 12 : 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#202020',
                            fontWeight: 500,
                            letterSpacing: '0.3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          Check List
                          {fields.length > 0 && (
                            <span
                              style={{
                                background: '#edf2f7',
                                color: '#4a5568',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '10px',
                                minWidth: '18px',
                                textAlign: 'center',
                              }}
                            >
                              {fields.length}
                            </span>
                          )}
                        </div>
                        <Button
                          type="text"
                          size="small"
                          onClick={() =>
                            add({
                              title: '',
                              assignee: null,
                              priority: 'medium',
                              endDate: '',
                            })
                          }
                          style={{
                            color: '#7c3aed',
                            fontSize: '12px',
                            fontWeight: 500,
                            height: '24px',
                            padding: '0 8px',
                          }}
                        >
                          + Tạo check list
                        </Button>
                      </div>
                      {/* Table Header */}
                      {fields.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 32px',
                            gap: '12px',
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderBottom: 'none',
                            background: '#f8f9fa',
                            borderRadius: '4px 4px 0 0',
                            fontSize: '11px',
                            color: '#202020',
                            fontWeight: 600,
                            letterSpacing: '0.3px',
                          }}
                        >
                          <div>Công việc</div>
                          <div>Đảm nhiệm</div>
                        </div>
                      )}
                      {/* Items */}
                      {fields.map(({ key, name }, index) => (
                        <div
                          key={key}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 32px',
                            gap: '12px',
                            padding: '8px 12px',
                            alignItems: 'center',
                            background: '#ffffff',
                            borderLeft: '1px solid #e2e8f0',
                            borderRight: '1px solid #e2e8f0',
                            borderBottom:
                              index === fields.length - 1
                                ? '1px solid #e2e8f0'
                                : '1px solid #f1f5f9',
                            fontSize: '13px',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: '14px',
                                height: '14px',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '2px',
                                flexShrink: 0,
                                backgroundColor: '#fff',
                              }}
                            />
                            <Form.Item name={[name, 'title']} style={{ margin: 0, flex: 1 }}>
                              <Input
                                placeholder="Tên công việc"
                                variant="borderless"
                                size="small"
                                style={{ fontSize: '13px' }}
                              />
                            </Form.Item>
                          </div>

                          <Form.Item name={[name, 'assignee']} style={{ margin: 0 }}>
                            <Select
                              placeholder="Đảm nhiệm"
                              variant="borderless"
                              size="small"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Item>

                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => remove(name)}
                            style={{
                              width: '24px',
                              height: '24px',
                              minWidth: '24px',
                              color: '#ef4444',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                      ))}
                      {fields.length === 0 && (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: '#9ca3af',
                            fontSize: '13px',
                            background: '#fafbfc',
                            borderRadius: 6,
                            border: '1px dashed #e2e8f0',
                          }}
                        >
                          Chưa có nhiệm vụ nào
                        </div>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};
