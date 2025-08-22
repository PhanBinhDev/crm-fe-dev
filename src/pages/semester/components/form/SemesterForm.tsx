import React from "react";
import { Form, Input, DatePicker, Select, Button, Space } from "antd";
import { useForm } from "@refinedev/antd";
import dayjs from "dayjs";

export const SemesterForm: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({ resource: "semesters" });

  return (
    <Form
      {...formProps}
      layout="vertical"
      initialValues={{
        year: new Date().getFullYear(),
        blocks: [],
      }}
    >
      {/* Tên kỳ học */}
      <Form.Item
        label="Tên kỳ học"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên kỳ học" }]}
      >
        <Input placeholder="Ví dụ: Học kỳ 1" />
      </Form.Item>

      {/* Năm */}
      <Form.Item
        label="Năm"
        name="year"
        rules={[{ required: true, message: "Vui lòng nhập năm" }]}
      >
        <Input type="number" placeholder="Ví dụ: 2025" />
      </Form.Item>

      {/* Trạng thái */}
      <Form.Item
        label="Trạng thái"
        name="status"
        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
      >
        <Select
          placeholder="Chọn trạng thái"
          options={[
            { value: "Ongoing", label: "Đang diễn ra" },
            { value: "Completed", label: "Đã hoàn thành" },
            { value: "Upcoming", label: "Sắp diễn ra" },
          ]}
        />
      </Form.Item>

      {/* Ngày bắt đầu */}
      <Form.Item
        label="Ngày bắt đầu"
        name="startDate"
        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
        getValueFromEvent={(value) => (value ? value.toISOString() : null)} // fix validate
        normalize={(value) => (value ? dayjs(value) : null)}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      {/* Ngày kết thúc */}
      <Form.Item
        label="Ngày kết thúc"
        name="endDate"
        rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
        getValueFromEvent={(value) => (value ? value.toISOString() : null)}
        normalize={(value) => (value ? dayjs(value) : null)}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      {/* Mô tả */}
      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Thêm mô tả kỳ học (không bắt buộc)" />
      </Form.Item>

      {/* Danh sách Block */}
      <Form.List name="blocks">
        {(fields, { add, remove }) => (
          <>
            <label>Danh sách Block</label>
            {fields.map((field) => (
              <Space key={field.key} align="baseline">
                <Form.Item
                  {...field}
                  name={[field.name, "name"]}
                  rules={[{ required: true, message: "Nhập tên block" }]}
                >
                  <Input placeholder="Tên block" />
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

      {/* Nút lưu */}
      <Form.Item>
        <Button type="primary" {...saveButtonProps}>
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
};
