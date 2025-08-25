import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, DatePicker } from 'antd';
import { useCreate, useList } from '@refinedev/core';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  LinkOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import {
  IconCalendar,
  IconClock,
  IconFlag,
  IconLink,
  IconBook,
  IconCircleCheck,
} from '@tabler/icons-react';
import { SelectProps } from 'antd/lib';
import Description from '../activityModalComponents/Description';
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

  const { mutate: createActivity, isPending } = useCreate();

  // Fetch stages for selection
  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  // Fetch semesters for selection
  const { data: semestersData } = useList({
    resource: 'semesters',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const stages = stagesData?.data || [];
  const semesters = semestersData?.data || [];

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const activityData = {
        ...values,
        stageId: stageId || values.stageId,
        status: 'new',
        type: values.type?.value || 'task',
        estimateTime: Number(values.estimateTime) || undefined,
      };

      console.log(activityData);

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
      <IconCircleCheck style={{ color: '#1890ff' }} size={16} />
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
      <IconCalendar style={{ color: '#52c41a' }} size={16} />
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
        confirmLoading={isPending}
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
              <Form.Item name={'type'}>
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
              </Form.Item>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Taskname */}
              <div style={{ marginBottom: 20 }}>
                <Form.Item name="name" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="Tên công việc"
                    style={{
                      fontSize: '20px',
                      fontWeight: 500,
                      border: 'none',
                      padding: '8px 20px',
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
                          <Form.Item
                            name="stageId"
                            rules={[{ required: true }]}
                            style={{ margin: 0, flex: 1 }}
                          >
                            <Select
                              defaultValue={stageId}
                              placeholder="Chọn trạng thái"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
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

                      {/* assignee */}
                      {/* <Col span={12}>
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
                            <Select
                              mode="multiple"
                              placeholder="Thêm người đảm nhiệm"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
                              size="small"
                              maxTagCount={3}
                            >
                              {users.map(user => (
                                <Option key={user.id} value={user.id}>
                                  {user.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </Col> */}
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
                          <Form.Item
                            name="semesterId"
                            rules={[{ required: true }]}
                            style={{ margin: 0, flex: 1 }}
                          >
                            <Select
                              placeholder="Chọn kỳ học "
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
                            >
                              {semesters.map(semester => (
                                <Option key={semester.id} value={semester.id}>
                                  {semester.name}
                                </Option>
                              ))}
                            </Select>
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
                          <Form.Item
                            name="priority"
                            rules={[{ required: true }]}
                            style={{ margin: 0, flex: 1 }}
                          >
                            <Select
                              placeholder="Chọn mức độ ưu tiên"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
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
                          <Form.Item name="estimateTime" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
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
                            <DatePicker
                              showTime
                              placeholder="Chọn ngày bắt đầu"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 14px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
                            />
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
                            <DatePicker
                              showTime
                              placeholder="Chọn ngày kết thúc"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 14px',
                                borderRadius: '5px',
                              }}
                              variant="borderless"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row gutter={24}>
                      {/* semester */}

                      {/* Link */}
                      <Col span={24}>
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
                          <Form.Item name="onlineLink" style={{ margin: 0, flex: 1 }}>
                            <div
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
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
              {/* <Subtasks users={users} /> */}

              {/* Checklist */}
              {/* <Checklists form={form} users={users} /> */}

              {/* Attachments */}
              {/* <Attachments /> */}
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};
