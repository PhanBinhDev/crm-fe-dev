import React from 'react';
import { Create } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import { useForm } from '@refinedev/react-hook-form';

const { TextArea } = Input;
const { Option } = Select;

export const ActivitiesCreatePage: React.FC = () => {
  const {
    refineCore: { onFinish, formLoading },
    register,
    formState: { errors },
  } = useForm();

  return (
    <Create isLoading={formLoading} saveButtonProps={{ onClick: onFinish }}>
      <Form layout="vertical">
        <Form.Item
          label="Tên hoạt động"
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message as string}
        >
          <Input {...register('name', { required: 'Tên hoạt động là bắt buộc' })} />
        </Form.Item>

        <Form.Item label="Mô tả">
          <TextArea {...register('description')} rows={4} />
        </Form.Item>

        <Form.Item label="Loại hoạt động">
          <Select {...register('type')}>
            <Option value="task">Nhiệm vụ</Option>
            <Option value="event">Sự kiện</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Độ ưu tiên">
          <Select {...register('priority')}>
            <Option value="low">Thấp</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="high">Cao</Option>
            <Option value="urgent">Khẩn cấp</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Thời gian bắt đầu">
          <DatePicker showTime {...register('startTime')} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Thời gian kết thúc">
          <DatePicker showTime {...register('endTime')} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Thời gian ước tính (phút)">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Bắt buộc" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
