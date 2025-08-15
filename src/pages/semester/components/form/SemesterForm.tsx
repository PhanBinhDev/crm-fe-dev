import React from 'react';
import { Form, Input, DatePicker, Select, Button, Space } from 'antd';
import { useForm } from '@refinedev/antd';

const { RangePicker } = DatePicker;

export const SemesterForm: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({ resource: 'semesters' });

  return (
    <Form {...formProps} layout="vertical">
      <Form.Item name="name" label="Tên kỳ học" rules={[{ required: true }]}>
        {' '}
        <Input />{' '}
      </Form.Item>
      <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
        {' '}
        <Input type="number" />{' '}
      </Form.Item>
      <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
        {' '}
        <Select
          options={[
            { value: 'Ongoing', label: 'Đang diễn ra' },
            { value: 'Completed', label: 'Đã hoàn thành' },
            { value: 'Upcoming', label: 'Sắp diễn ra' },
          ]}
        />{' '}
      </Form.Item>
      <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
        {' '}
        <DatePicker style={{ width: '100%' }} />{' '}
      </Form.Item>
      <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
        {' '}
        <DatePicker style={{ width: '100%' }} />{' '}
      </Form.Item>
      <Form.Item name="description" label="Mô tả">
        {' '}
        <Input.TextArea rows={3} />{' '}
      </Form.Item>
      {/* Block input: nhập nhiều block */}
      <Form.List name="blocks">
        {(fields, { add, remove }) => (
          <>
            <label>Danh sách Block</label>
            {fields.map(field => (
              <Space key={field.key} align="baseline">
                <Form.Item
                  {...field}
                  name={[field.name, 'name']}
                  rules={[{ required: true, message: 'Nhập tên block' }]}
                >
                  {' '}
                  <Input placeholder="Tên block" />{' '}
                </Form.Item>
                <Button type="link" danger onClick={() => remove(field.name)}>
                  Xóa
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} style={{ marginTop: 8 }}>
              Thêm block
            </Button>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" {...saveButtonProps}>
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
};
