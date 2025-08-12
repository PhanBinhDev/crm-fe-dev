import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Upload,
  Button,
  DatePicker,
  Dropdown,
  Checkbox,
} from 'antd';
import { useCreate, useList } from '@refinedev/core';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FlagOutlined,
  LinkOutlined,
  MoreOutlined,
  PaperClipOutlined,
  PartitionOutlined,
  ReadOutlined,
  RightOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { SelectProps } from 'antd/lib';
import { formatFileSize, getFileIcon } from '@/utils/activity';
import Attachments from './activityModalComponents/Attachments';
import Subtasks from './activityModalComponents/Subtasks';
import Description from './activityModalComponents/Description';
import Checklists from './activityModalComponents/Checklists';
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

  const taskLabel = (
    <Title
      level={3}
      style={{
        color: '#202020',
        fontWeight: 600,
        fontSize: '14px',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <CheckCircleOutlined style={{ color: '#1890ff' }} />
      Tạo công việc mới
    </Title>
  );

  const eventLabel = (
    <Title
      level={3}
      style={{
        color: '#202020',
        fontWeight: 600,
        fontSize: '14px',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <CalendarOutlined style={{ color: '#52c41a' }} />
      Tạo sự kiện mới
    </Title>
  );

  const activitySelect: SelectProps<any> = {
    options: [
      { label: taskLabel, value: 'task' },
      { label: eventLabel, value: 'event' },
    ],
  };

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
              <Select
                {...activitySelect}
                labelInValue
                defaultValue={{ value: 'task', label: taskLabel }}
                variant="borderless"
                style={{
                  width: '20%',
                  color: '#202020',
                  fontWeight: 600,
                  fontSize: '18px',
                  margin: 0,
                }}
                size="small"
              />
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Taskname */}
              <div style={{ marginBottom: 20 }}>
                <Form.Item name="title" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="Tên công việc"
                    style={{
                      fontSize: '20px',
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
                  border: '1px solid #e6e9ef',
                }}
              >
                <Row gutter={[0, 12]}>
                  <Col span={24}>
                    <Row gutter={24}>
                      {/* Status */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,
                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <CheckCircleOutlined style={{ color: '#8c8c8c' }} />
                            Trạng thái
                          </div>
                          <Form.Item name="stageId" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Select
                                defaultValue={stageId}
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
                            </div>
                          </Form.Item>
                        </div>
                      </Col>

                      {/* assignee */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,
                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <TeamOutlined style={{ color: '#8c8c8c' }} />
                            Đảm nhiệm
                          </div>
                          <Form.Item name="assignees" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Select
                                mode="multiple"
                                placeholder="Thêm người đảm nhiệm"
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                                maxTagCount={3}
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      {/* Priority */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <FlagOutlined style={{ color: '#8c8c8c' }} />
                            Ưu tiên
                          </div>
                          <Form.Item name="priority" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Select
                                placeholder="Chọn mức độ ưu tiên"
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                                defaultValue={'medium'}
                                options={[
                                  { label: '🔴 Urgent', value: 'urgent' },
                                  { label: '🟡 High', value: 'high' },
                                  { label: '🔵 Normal', value: 'medium' },
                                  { label: '⚪ Low', value: 'low' },
                                ]}
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>

                      {/* estimate */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,
                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                            Ước lượng giờ
                          </div>
                          <Form.Item name="estimate" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Input
                                placeholder="Ước lượng thời gian thực hiện"
                                variant="borderless"
                                size="small"
                                suffix={
                                  <span style={{ color: '#202020', fontSize: '12px' }}>phút</span>
                                }
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      {/* start date */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                            Ngày bắt đầu
                          </div>
                          <Form.Item name="startTime" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <DatePicker
                                showTime
                                placeholder="Chọn ngày bắt đầu"
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                      {/* end date */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,
                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                            Ngày kết thúc
                          </div>
                          <Form.Item name="endTime" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <DatePicker
                                showTime
                                placeholder="Chọn ngày kết thúc"
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      {/* semester */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <ReadOutlined style={{ color: '#8c8c8c' }} />
                            Kỳ học
                          </div>
                          <Form.Item name="semester" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Select
                                placeholder="Chọn kỳ học "
                                style={{ width: '100%' }}
                                variant="borderless"
                                size="small"
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>

                      {/* Link */}
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                          <div
                            style={{
                              width: '120px',
                              fontSize: '14px',
                              color: '#202020',
                              fontWeight: 500,

                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <LinkOutlined style={{ color: '#8c8c8c' }} />
                            Liên kết
                          </div>
                          <Form.Item name="link" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '95%',
                                padding: '3px 0',
                                borderRadius: '5px',
                              }}
                            >
                              <Input
                                placeholder="Dán một liên kết"
                                variant="borderless"
                                size="small"
                              />
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>

              {/* Description */}
              <Description />

              {/* Subtask */}
              <Subtasks />

              {/* Checklist */}
              <Checklists form={form} />

              {/* Attachments */}
              <Attachments />
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};
