import { IStage } from '@/common/types';
import { Form, Input, Modal } from 'antd';
import React from 'react';

interface StageModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: IStage;
  loading?: boolean;
}

export const StageModal: React.FC<StageModalProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = (values?: any) => {
    onFinish(values);
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa trạng thái' : 'Thêm trạng thái mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Tên trạng thái"
          rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
        >
          <Input placeholder="Nhập tên trạng thái..." disabled={loading} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
