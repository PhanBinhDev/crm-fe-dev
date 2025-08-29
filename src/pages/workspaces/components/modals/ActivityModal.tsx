import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, DatePicker, message } from 'antd';
import { useCreate, useList } from '@refinedev/core';
import {
  IconCircleCheck,
  IconCalendar,
  IconFlag,
  IconClock,
  IconLink,
  IconUser,
} from '@tabler/icons-react';
import Description from '../activityModalComponents/Description';

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
  const [activeTab, setActiveTab] = useState<'task' | 'event'>('task');

  const { mutate: createActivity, isPending } = useCreate();

  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
  });
  const { data: semestersData } = useList({
    resource: 'semesters',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
  });
  const { data: usersData } = useList({
    resource: 'users/all',
    pagination: { mode: 'off' },
    sorters: [{ field: 'name', order: 'asc' }],
  });

  const stages = stagesData?.data || [];
  const semesters = semestersData?.data || [];
  const users = usersData?.data || [];

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setActiveTab('task');
      if (stageId) {
        form.setFieldsValue({ stageId });
      }
    }
  }, [visible, stageId, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const activityData = {
        ...values,
        stageId: stageId || values.stageId,
        status: 'new',
        type: activeTab,
        estimateTime: values.estimateTime ? Number(values.estimateTime) : undefined,
        assignees: values.assignees || [],
      };

      createActivity(
        {
          resource: 'activities',
          values: activityData,
        },
        {
          onSuccess: () => {
            form.resetFields();
            message.success('Tạo hoạt động thành công');
            onSuccess();
          },
          onError: () => {
            message.error('Tạo hoạt động thất bại');
          },
        },
      );
    });
  };

  const priorityOptions = [
    {
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconFlag size={14} style={{ color: '#ff4d4f', marginRight: 6 }} />
          Urgent
        </div>
      ),
      value: 'urgent',
    },
    {
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconFlag size={14} style={{ color: '#faad14', marginRight: 6 }} />
          High
        </div>
      ),
      value: 'high',
    },
    {
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconFlag size={14} style={{ color: '#1890ff', marginRight: 6 }} />
          Normal
        </div>
      ),
      value: 'medium',
    },
    {
      label: (
        <div>
          <IconFlag size={14} style={{ color: '#bfbfbf', marginRight: 6 }} />
          Low
        </div>
      ),
      value: 'low',
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isPending}
      width={800}
      centered
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeTab === 'task' ? (
            <IconCircleCheck style={{ color: '#1890ff' }} size={20} />
          ) : (
            <IconCalendar style={{ color: '#52c41a' }} size={20} />
          )}
          {activeTab === 'task' ? 'Tạo công việc mới' : 'Tạo sự kiện mới'}
        </span>
      }
      styles={{ body: { background: '#fff', padding: 0 } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as 'task' | 'event')}
        items={[
          {
            key: 'task',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}>
                <IconCircleCheck style={{ color: '#1890ff' }} size={16} />
                Công việc
              </span>
            ),
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Tên công việc"
                  name="name"
                  rules={[{ required: true, message: 'Nhập tên công việc' }]}
                >
                  <Input
                    placeholder="Nhập tên công việc"
                    size="middle"
                    style={{ fontWeight: 500 }}
                  />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Trạng thái"
                      name="stageId"
                      rules={[{ required: true, message: 'Chọn trạng thái' }]}
                    >
                      <Select placeholder="Chọn trạng thái" style={{ width: '100%' }} size="middle">
                        {stages.map(stage => (
                          <Option key={stage.id} value={stage.id}>
                            {stage.title}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Kỳ học"
                      name="semesterId"
                      rules={[{ required: true, message: 'Chọn kỳ học' }]}
                    >
                      <Select placeholder="Chọn kỳ học" style={{ width: '100%' }} size="middle">
                        {semesters.map(semester => (
                          <Option key={semester.id} value={semester.id}>
                            {semester.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Người đảm nhiệm" name="assignees">
                      <Select
                        mode="multiple"
                        placeholder="Chọn người đảm nhiệm"
                        style={{ width: '100%' }}
                        size="middle"
                        maxTagCount={3}
                        optionLabelProp="label"
                      >
                        {users.map(user => (
                          <Option key={user.id} value={user.id} label={user.name}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <IconUser size={16} style={{ color: '#1890ff' }} />
                              {user.name}
                            </span>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ưu tiên" name="priority" rules={[{ required: true }]}>
                      <Select
                        placeholder="Chọn mức độ ưu tiên"
                        options={priorityOptions}
                        style={{ width: '100%' }}
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ước lượng thời gian (phút)" name="estimateTime">
                      <Input
                        placeholder="Ước lượng thời gian thực hiện"
                        size="middle"
                        type="number"
                        min={0}
                        suffix={<IconClock size={16} style={{ color: '#8c8c8c' }} />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Liên kết online" name="onlineLink">
                      <Input
                        placeholder="Dán một liên kết"
                        size="middle"
                        prefix={<IconLink size={16} style={{ color: '#8c8c8c' }} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ngày bắt đầu" name="startTime">
                      <DatePicker
                        showTime
                        placeholder="Chọn ngày bắt đầu"
                        style={{ width: '100%' }}
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ngày kết thúc" name="endTime">
                      <DatePicker
                        showTime
                        placeholder="Chọn ngày kết thúc"
                        style={{ width: '100%' }}
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="description">
                  <Description />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'event',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}>
                <IconCalendar style={{ color: '#52c41a' }} size={16} />
                Sự kiện
              </span>
            ),
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Tên sự kiện"
                  name="name"
                  rules={[{ required: true, message: 'Nhập tên sự kiện' }]}
                >
                  <Input placeholder="Nhập tên sự kiện" size="middle" style={{ fontWeight: 500 }} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Trạng thái"
                      name="stageId"
                      rules={[{ required: true, message: 'Chọn trạng thái' }]}
                    >
                      <Select placeholder="Chọn trạng thái" style={{ width: '100%' }} size="middle">
                        {stages.map(stage => (
                          <Option key={stage.id} value={stage.id}>
                            {stage.title}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Kỳ học"
                      name="semesterId"
                      rules={[{ required: true, message: 'Chọn kỳ học' }]}
                    >
                      <Select placeholder="Chọn kỳ học" style={{ width: '100%' }} size="middle">
                        {semesters.map(semester => (
                          <Option key={semester.id} value={semester.id}>
                            {semester.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Người tham gia" name="assignees">
                      <Select
                        mode="multiple"
                        placeholder="Chọn người tham gia"
                        style={{ width: '100%' }}
                        size="middle"
                        maxTagCount={3}
                        optionLabelProp="label"
                      >
                        {users.map(user => (
                          <Option key={user.id} value={user.id} label={user.name}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <IconUser size={16} style={{ color: '#1890ff' }} />
                              {user.name}
                            </span>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Địa điểm" name="location">
                      <Input placeholder="Nhập địa điểm tổ chức" size="middle" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ngày bắt đầu" name="startTime">
                      <DatePicker
                        showTime
                        placeholder="Chọn ngày bắt đầu"
                        style={{ width: '100%' }}
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ngày kết thúc" name="endTime">
                      <DatePicker
                        showTime
                        placeholder="Chọn ngày kết thúc"
                        style={{ width: '100%' }}
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Mô tả" name="description">
                  <Description />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};
