import { DatePicker, Form, Input, Select, Button, InputNumber, Row, Col, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import moment, { Moment } from 'moment';

interface SemesterFormProps {
  onFinish: (values: any) => void | Promise<void>;
  isEdit: boolean;
  initialValues?: any;
  formProps?: any; 
}

const fixedNames = ['Spring', 'Summer', 'Fall'];

const SemesterForm: React.FC<SemesterFormProps> = ({ onFinish, isEdit, initialValues, formProps }) => {
  const [form] = Form.useForm(formProps?.form); 
  const [customName, setCustomName] = useState(false);

  useEffect(() => {
    if (initialValues) {
      const isCustom = !fixedNames.includes(initialValues.name);
      setCustomName(isCustom);

      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? moment(initialValues.startDate) : null,
        endDate: initialValues.endDate ? moment(initialValues.endDate) : null,
        name: isCustom ? 'other' : initialValues.name,
        nameCustom: isCustom ? initialValues.name : undefined,
      });
    }
  }, [initialValues, form]);

  const onStartDateChange = (date: Moment | null) => {
    if (date) {
      const newEndDate = date.clone().add(90, 'days');
      form.setFieldsValue({ endDate: newEndDate });
    } else {
      form.setFieldsValue({ endDate: null });
    }
  };

  const validateEndDate = (_rule: any, value: Moment) => {
    const startDate = form.getFieldValue('startDate');
    if (value && startDate && value.isBefore(startDate, 'day')) {
      return Promise.reject(new Error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu'));
    }
    return Promise.resolve();
  };

  const handleNameChange = (value: string) => {
    if (value === 'other') {
      setCustomName(true);
      form.setFieldsValue({ nameCustom: '' });
    } else {
      setCustomName(false);
      form.setFieldsValue({ name: value, nameCustom: undefined });
    }
  };

  return (
    <Card style={{ maxWidth: '90%', margin: '40px auto', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} bodyStyle={{ padding: 24 }}>
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        onFinish={(values) => {
          if (customName && values.nameCustom) {
            values.name = values.nameCustom;
          }
          delete values.nameCustom;
          onFinish(values);
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item label="Tên kỳ học" name="name" rules={[{ required: true, message: 'Vui lòng chọn tên kỳ học' }]}>
              <Select placeholder="Chọn kỳ học" onChange={handleNameChange} value={customName ? 'other' : form.getFieldValue('name')}>
                <Select.Option value="Spring">Kỳ Spring</Select.Option>
                <Select.Option value="Summer">Kỳ Summer</Select.Option>
                <Select.Option value="Fall">Kỳ Fall</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>

            {customName && (
              <Form.Item name="nameCustom" rules={[{ required: true, message: 'Vui lòng nhập tên kỳ học' }]}>
                <Input placeholder="Nhập tên kỳ học" />
              </Form.Item>
            )}

            <Form.Item name="year" label="Năm" rules={[{ required: true, message: 'Vui lòng nhập năm' }]}>
              <InputNumber style={{ width: '100%' }} min={2000} max={2100} placeholder="Chọn năm" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" onChange={onStartDateChange} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  dependencies={['startDate']}
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }, { validator: validateEndDate }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea placeholder="Nhập mô tả kỳ học" rows={4} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                placeholder="Chọn trạng thái"
                options={[
                  { label: 'Đang diễn ra', value: 'Ongoing' },
                  { label: 'Đã kết thúc', value: 'Completed' },
                  { label: 'Sắp diễn ra', value: 'Upcoming' },
                ]}
              />
            </Form.Item>

            <Form.Item name="blocks" label="Block" rules={[{ required: true, message: 'Vui lòng chọn block' }]}>
              <Select
                mode="multiple"
                placeholder="Chọn block"
                options={[
                  { label: 'Block 1', value: 'Block 1' },
                  { label: 'Block 2', value: 'Block 2' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={12}>
          <Col>
            <Button htmlType="button">Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Cập nhật' : 'Lưu'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SemesterForm;
