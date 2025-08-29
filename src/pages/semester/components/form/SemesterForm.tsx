import React from "react";
import { Form, Input, DatePicker, Select, Button,  Alert } from "antd";
import dayjs from "dayjs";
import { SaveButtonProps } from "@refinedev/antd";


interface SemesterFormProps {
  formProps: any;
  saveButtonProps?: SaveButtonProps;
  serverError?: string | null;
}

type SemesterName = "Spring" | "Summer" | "Fall";

const DEFAULT_DURATION_DAYS = 90;

// Tạo 3 kỳ theo rule cố định
function generateSemesters(year: number) {
  const springStart = dayjs(`${year}-01-07`).startOf("day");
  const springEnd = springStart.add(DEFAULT_DURATION_DAYS, "day");

  const summerStart = dayjs(`${year}-06-07`).startOf("day");
  const summerEnd = summerStart.add(DEFAULT_DURATION_DAYS, "day");

  const fallStart = dayjs(`${year}-09-15`).startOf("day");
  const fallEnd = fallStart.add(DEFAULT_DURATION_DAYS, "day");

  return [
    {
      name: `Spring ${year}`,
      shortName: "Spring" as SemesterName,
      year,
      startDate: springStart,
      endDate: springEnd,
      status: "Upcoming",
      description: "",
      blocks: [] as { name: string }[],
    },
    {
      name: `Summer ${year}`,
      shortName: "Summer" as SemesterName,
      year,
      startDate: summerStart,
      endDate: summerEnd,
      status: "Upcoming",
      description: "",
      blocks: [] as { name: string }[],
    },
    {
      name: `Fall ${year}`,
      shortName: "Fall" as SemesterName,
      year,
      startDate: fallStart,
      endDate: fallEnd,
      status: "Upcoming",
      description: "",
      blocks: [] as { name: string }[],
    },
  ];
}

export const SemesterForm: React.FC<SemesterFormProps> = ({ formProps, saveButtonProps, serverError }) => {
  const form = formProps.form;

  // Đổi startDate → auto set endDate = start + 90 ngày
  const handleStartChange = (idx: number, d: dayjs.Dayjs | null) => {
    if (!d) return;
    const list = form.getFieldValue("semesters") || [];
    list[idx] = { ...list[idx], startDate: d, endDate: d.add(DEFAULT_DURATION_DAYS, "day") };
    form.setFieldsValue({ semesters: list });
  };

  // Khi đổi năm → regenerate
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseInt(e.target.value, 10);
    if (!Number.isFinite(y)) return;
    form.setFieldsValue({ year: y, semesters: generateSemesters(y) });
  };

  const initialYear = new Date().getFullYear();

  return (
    <Form
      {...formProps}
      layout="vertical"
      initialValues={{
        year: initialYear,
        semesters: generateSemesters(initialYear),
      }}
      onFinish={(values) => {
        const y = Number(values.year);
        const normalized = (values.semesters || []).map((s: any) => {
          const baseName = s.shortName || s.name.split(" ")[0];
          return {
            name: `${baseName} ${y}`,
            year: y,
            startDate: s.startDate ? dayjs(s.startDate).toISOString() : null,
            endDate: s.endDate ? dayjs(s.endDate).toISOString() : null,
            status: s.status,
            description: s.description || "",
            blocks: s.blocks || [],
          };
        });
        return formProps.onFinish?.(normalized);
      }}
    >
      {/* Hiển thị lỗi từ BE */}
      {serverError ? (
        <Alert
          type="error"
          message="Không thể tạo kỳ học"
          description={serverError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {/* Năm */}
      <Form.Item
        label="Năm"
        name="year"
        rules={[
          { required: true, message: "Vui lòng nhập năm" },
          {
            validator: (_, v) => {
              if (v == null || v === "") return Promise.resolve();
              const y = Number(v);
              if (!Number.isInteger(y) || y < 1900 || y > 3000) return Promise.reject(new Error("Năm không hợp lệ"));
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input type="number" placeholder="Ví dụ: 2025" onChange={handleYearChange} />
      </Form.Item>

 

      <Form.List name="semesters">
  {(fields, { remove }) => (
    <>
      {fields.map((field, idx) => (
        <div
          key={field.key}
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {/* Header + Nút Xóa */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{form.getFieldValue(["semesters", field.name, "name"])}</strong>
            <Button danger type="link" onClick={() => remove(field.name)}>
              Xóa kỳ này
            </Button>
          </div>

          {/* Name (readonly) */}
          <Form.Item
            label="Tên kỳ"
            name={[field.name, "name"]}
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          {/* Start */}
          <Form.Item
            label="Ngày bắt đầu"
            name={[field.name, "startDate"]}
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              onChange={(d) => handleStartChange(idx, d)}
            />
          </Form.Item>

          {/* End */}
          <Form.Item
            label="Ngày kết thúc"
            name={[field.name, "endDate"]}
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Status */}
          <Form.Item
            label="Trạng thái"
            name={[field.name, "status"]}
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={[
                { value: "Ongoing", label: "Đang diễn ra" },
                { value: "Completed", label: "Đã hoàn thành" },
                { value: "Upcoming", label: "Sắp diễn ra" },
              ]}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item label="Mô tả" name={[field.name, "description"]}>
            <Input.TextArea rows={2} placeholder="Mô tả (không bắt buộc)" />
          </Form.Item>
        </div>
      ))}
    </>
  )}
</Form.List>


      <Form.Item style={{ textAlign: "right" }}>
        <Button type="primary" htmlType="submit" {...saveButtonProps} >
          Lưu 3 kỳ cho năm này
        </Button>
      </Form.Item>
    </Form>
  );
};
