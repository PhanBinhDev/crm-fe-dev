import React from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import { useCreate, useList } from '@refinedev/core';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

const { TextArea } = Input;
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

  useBodyScrollLock(visible);

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
    <Modal
      title="Tạo hoạt động mới"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên hoạt động"
          rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại hoạt động"
          rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động' }]}
        >
          <Select>
            <Option value="task">Nhiệm vụ</Option>
            <Option value="event">Sự kiện</Option>
          </Select>
        </Form.Item>

        <Form.Item name="priority" label="Độ ưu tiên">
          <Select>
            <Option value="low">Thấp</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="high">Cao</Option>
            <Option value="urgent">Khẩn cấp</Option>
          </Select>
        </Form.Item>

        {!stageId && (
          <Form.Item name="stageId" label="Giai đoạn">
            <Select>
              {stages.map(stage => (
                <Option key={stage.id} value={stage.id}>
                  {stage.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="startTime" label="Thời gian bắt đầu" style={{ flex: 1 }}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="endTime" label="Thời gian kết thúc" style={{ flex: 1 }}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="estimateTime" label="Thời gian ước tính (phút)" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="mandatory" label="Bắt buộc" valuePropName="checked" style={{ flex: 1 }}>
            <Switch />
          </Form.Item>
        </div>

        <Form.Item name="location" label="Địa điểm">
          <Input />
        </Form.Item>

        <Form.Item name="onlineLink" label="Link online">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
