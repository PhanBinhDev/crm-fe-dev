import { FC, useEffect } from 'react';
import { Form, Input, Select, Row, Col, Card } from 'antd';
import type { IUser } from '@/common/types';
import { userStatusFilterOptions, userRoleFilterOptions } from '@/constants/user';

interface UserFormProps {
  initialValues?: IUser;
  onFinish: (values: any) => void;
  isEdit?: boolean;
  isSelfEdit?: boolean;
}

export const UserForm: FC<UserFormProps> = ({
  initialValues,
  onFinish,
  isEdit = false,
  isSelfEdit = false,
}) => {
  const [form] = Form.useForm();

  const transformedInitialValues = initialValues
    ? {
        ...initialValues,
        isActive: initialValues.isActive ?? true,
      }
    : undefined;

  useEffect(() => {
    if (transformedInitialValues) {
      form.setFieldsValue(transformedInitialValues);
    }
  }, [form, transformedInitialValues]);

  return (
    <Card
      style={{
        maxWidth: '90%',
        margin: '40px auto',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
      bodyStyle={{ padding: 24 }}
    >
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <h2 style={{ margin: 0 }}>{isEdit ? 'Cập nhật người dùng' : 'Tạo người dùng mới'}</h2>
        </Col>
        {/* <Col>
          {form.getFieldValue('isActive') ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="red">Inactive</Tag>
          )}
        </Col> */}
      </Row>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={transformedInitialValues}
        onFinish={onFinish}
        key={initialValues?.id}
      >
        <Row gutter={24}>
          {/* Left column */}
          <Col span={16}>
            <Form.Item
              name="email"
              label={
                <span>
                  Email
                  {isEdit && (
                    <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                      (Không thể thay đổi)
                    </span>
                  )}
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập email" disabled={isEdit} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          {/* Right column */}
          <Col span={8}>
            <Form.Item
              name="role"
              label={
                <span>
                  Vai trò
                  {isSelfEdit && (
                    <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                      (Không thể tự thay đổi)
                    </span>
                  )}
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select
                options={userRoleFilterOptions}
                disabled={isSelfEdit}
                placeholder="Chọn vai trò"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={
                <span>
                  Trạng thái
                  {isSelfEdit && (
                    <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                      (Không thể tự thay đổi)
                    </span>
                  )}
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select
                options={userStatusFilterOptions}
                disabled={isSelfEdit}
                placeholder="Chọn trạng thái"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer */}
        {/* <Row justify="end" gutter={12}>
          <Col>
            <Button htmlType="button">Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Cập nhật' : 'Lưu'}
            </Button>
          </Col>
        </Row> */}
      </Form>
    </Card>
  );
};
