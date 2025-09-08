import { IActivity, IUser } from '@/common/types';
import Attachments from '@/pages/workspaces/components/activityModalComponents/Attachments';
import Checklists from '@/pages/workspaces/components/activityModalComponents/Checklists';
import Subtasks from '@/pages/workspaces/components/activityModalComponents/Subtasks';
import { getUsername } from '@/utils/formatter';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  LinkOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useList, useUpdate } from '@refinedev/core';
import {
  Avatar,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { SelectProps } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
const { Title } = Typography;

const { Option } = Select;

interface EditActivityModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  activity?: IActivity;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onCancel,
  onSuccess,
  activity,
}) => {
  const { mutate: updateActivity, isLoading } = useUpdate({
    successNotification: false,
    errorNotification: false,
  });
  const [form] = Form.useForm();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (activity) {
        form.setFieldsValue(activity);
      }
    }
  }, [isOpen, form, activity]);

  // Fetch stages for selection
  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  // Fetch users for selection
  const { data: usersData } = useList<IUser>({
    resource: 'users/all',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  // Fetch semesters for selection
  const { data: semestersData } = useList({
    resource: 'semesters',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const { data: userAssigned } = useList({
    resource: activity?.id ? `activities/${activity?.id}/assignees` : undefined,
  });

  const stages = stagesData?.data || [];
  const users = usersData?.data || [];
  const semesters = semestersData?.data || [];
  const assignees = userAssigned?.data || [];

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const activityData = {
        ...values,
        type: values.type?.value || 'task',
        estimateTime: Number(values.estimateTime) || undefined,
      };

      activityData.assignees = undefined;

      updateActivity(
        {
          resource: 'activities',
          id: activity?.id,
          values: activityData,
          mutationMode: 'optimistic',
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: ({ data }) => {
            message.success(data.message || 'Tên hoạt động đã được cập nhật');
            onSuccess();
          },
          onError: error => {
            message.error(error.message || 'Không thể cập nhật tên hoạt động');
          },
        },
      );
    });
  };

  const handleAssignee = () => {
    console.log(selectedUsers);
  };

  React.useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (activity) {
        const formData = {
          type: activity.type,
          name: activity.name,
          stageId: activity.stageId,
          description: activity.description,
          semesterId: activity.semester.id || null,
          estimateTime: activity.estimateTime || '',
          priority: activity.priority || '',
          startTime: activity.startTime ? dayjs(activity.startTime) : null,
          endTime: activity.endTime ? dayjs(activity.endTime) : null,
          onlineLink: activity.onlineLink || '',
          assignees,
        };
        form.setFieldsValue(formData);
      }
    }
  }, [isOpen, activity, form]);

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
      Công việc
    </Title>
  );

  const tagRender = (props: any) => {
    const { value, closable, onClose } = props;
    const user = users.find(u => u.id === value);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 3px',
          background: '#f0f0f0',
          borderRadius: '12px',
          height: 20,
          fontSize: 12,
          marginRight: 4,
          position: 'relative',
        }}
      >
        {user?.avatar ? (
          <Avatar src={user.avatar} size={24} style={{ marginRight: 4 }} />
        ) : (
          <Avatar size={24} style={{ marginRight: 4, fontSize: 10, backgroundColor: '#333' }}>
            {getUsername(user?.name || '')}
          </Avatar>
        )}
        {closable && (
          <span
            style={{
              marginLeft: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '13px',
              height: '13px',
              borderRadius: '1000px',
              backgroundColor: '#333',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 10,
              position: 'absolute',
              top: '-9px',
              right: '-3px',
            }}
            onClick={onClose}
          >
            ×
          </span>
        )}
      </div>
    );
  };

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
      Sự kiện
    </Title>
  );

  const activitySelect: SelectProps<any> = {
    options: [
      { label: taskLabel, value: 'task' },
      { label: eventLabel, value: 'event' },
    ],
  };

  console.log(users);

  return (
    <>
      <Modal
        open={isOpen}
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
                            <Select
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
                            <Select
                              mode="multiple"
                              placeholder="Thêm người đảm nhiệm"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: '5px',
                              }}
                              tagRender={tagRender}
                              variant="borderless"
                              size="small"
                              maxTagCount={3}
                              onChange={values => setSelectedUsers(values)}
                              onBlur={handleAssignee}
                              onDeselect={values => {
                                console.log(values);
                              }}
                            >
                              {users.map(user => (
                                <Option key={user.id} value={user.id}>
                                  <Tooltip
                                    placement="bottom"
                                    color="#fff"
                                    title={
                                      <div style={{ backgroundColor: '#fff', color: '#333' }}>
                                        <div>
                                          <b>{user.name}</b>
                                        </div>
                                        <div>
                                          <b>Email:</b> {user.email}
                                        </div>
                                        <div>
                                          <b>Phone:</b> {user.phone}
                                        </div>
                                      </div>
                                    }
                                  >
                                    {user.avatar ? (
                                      <Space>
                                        <Avatar src={user.avatar} />
                                        <div>
                                          <p>{user.name} </p> <p>{user.email}</p>
                                        </div>
                                      </Space>
                                    ) : (
                                      <Avatar style={{ backgroundColor: '#333' }}>
                                        {getUsername(user.name)}
                                      </Avatar>
                                    )}
                                  </Tooltip>
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
                          <Form.Item name="priority" style={{ margin: 0, flex: 1 }}>
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
                            <Input
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 13px',
                                borderRadius: '5px',
                              }}
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
                          <Form.Item name="semesterId" style={{ margin: 0, flex: 1 }}>
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
                          <Form.Item name="onlineLink" style={{ margin: 0, flex: 1 }}>
                            <Input
                              placeholder="Dán một liên kết"
                              variant="borderless"
                              size="small"
                              style={{
                                background: '#f9f9f9',
                                width: '100%',
                                padding: '4px 13px',
                                borderRadius: '5px',
                              }}
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>

              {/* Description */}
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#202020',
                        fontWeight: 500,

                        letterSpacing: '0.3px',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <FileTextOutlined style={{ color: '#8c8c8c' }} />
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
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </Form>
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #e6e9ef',
            }}
          >
            {/* Subtask */}
            <Subtasks users={users} />

            {/* Checklist */}
            <Checklists form={form} users={users} />

            {/* Attachments */}
            <Attachments />
          </div>
        </div>
      </Modal>
    </>
  );
};
