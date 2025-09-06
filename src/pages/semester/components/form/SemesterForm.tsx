import { CloseOutlined } from '@ant-design/icons';
import { SaveButtonProps } from '@refinedev/antd';
import { Alert, Button, DatePicker, Form, Input, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

interface SemesterFormProps {
  formProps: any;
  saveButtonProps?: SaveButtonProps;
  serverError?: string | null;
}

type SemesterName = 'Spring' | 'Summer' | 'Fall';

const DEFAULT_DURATION_DAYS = 90;

const SEMESTER_STARTS: Record<SemesterName, string> = {
  Spring: '-01-10',
  Summer: '-06-07',
  Fall: '-09-15',
};

function generateOneSemester(shortName: SemesterName, year: number) {
  const start = dayjs(`${year}${SEMESTER_STARTS[shortName]}`);

  return {
    name: `${shortName} ${year}`,
    shortName,
    year,
    startDate: start,
    endDate: start.add(DEFAULT_DURATION_DAYS, 'day'),
    status: 'Upcoming',
    description: '',
    blocks: [] as { name: string }[],
  };
}

function generateRemainingSemesters(year: number) {
  const today = dayjs();

  return (Object.keys(SEMESTER_STARTS) as SemesterName[])
    .filter(shortName => {
      const start = dayjs(`${year}${SEMESTER_STARTS[shortName]}`);
      return start.isAfter(today, 'day');
    })
    .map(s => generateOneSemester(s, year));
}

export const SemesterForm: React.FC<SemesterFormProps> = ({
  formProps,
  saveButtonProps,
  serverError,
}) => {
  const form = formProps.form;
  const [errorVisible, setErrorVisible] = useState(true);

  const today = dayjs();
  const currentYear = today.year();

  const year = Form.useWatch('year', form) || currentYear;
  const semesters = Form.useWatch('semesters', form) || [];

  // Khi đổi ngày bắt đầu → auto set ngày kết thúc
  const handleStartChange = (idx: number, d: dayjs.Dayjs | null) => {
    if (!d) return;
    const list = [...semesters];
    list[idx] = {
      ...list[idx],
      startDate: d,
      endDate: d.add(DEFAULT_DURATION_DAYS, 'day'),
    };
    form.setFieldsValue({ semesters: list });
  };

  // Khi đổi năm → regenerate kỳ hợp lệ
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseInt(e.target.value, 10);
    if (!Number.isFinite(y)) return;
    const updated = y < currentYear ? [] : generateRemainingSemesters(y);
    form.setFieldsValue({ year: y, semesters: updated });
  };

  return (
    <Form
      {...formProps}
      layout="vertical"
      initialValues={{
        year: currentYear,
        semesters: generateRemainingSemesters(currentYear),
      }}
      onFinish={values => {
        const y = Number(values.year);
        const normalized = (values.semesters || []).map((s: any) => ({
          name: `${s.shortName} ${y}`,
          year: y,
          startDate: s.startDate ? dayjs(s.startDate).toISOString() : null,
          endDate: s.endDate ? dayjs(s.endDate).toISOString() : null,
          status: s.status,
          description: s.description || '',
          blocks: s.blocks || [],
        }));
        return formProps.onFinish?.(normalized);
      }}
    >
      {/* Thông báo lỗi từ BE */}
      {serverError && errorVisible && (
        <Alert
          type="error"
          message="Không thể tạo kỳ học"
          description={serverError}
          showIcon
          closable
          closeIcon={<CloseOutlined style={{ color: 'red' }} />}
          onClose={() => setErrorVisible(false)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Năm */}
      <Form.Item
        label="Năm"
        name="year"
        rules={[
          { required: true, message: 'Vui lòng nhập năm' },
          {
            validator: (_, v) => {
              if (v == null || v === '') return Promise.resolve();
              const y = Number(v);
              if (!Number.isInteger(y) || y < currentYear)
                return Promise.reject(new Error(`Năm không hợp lệ. Phải ≥ ${currentYear}`));
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input type="number" placeholder={`Ví dụ: ${currentYear}`} onChange={handleYearChange} />
      </Form.Item>

      {/* Danh sách kỳ */}
      <Form.List name="semesters">
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, idx) => (
              <div
                key={field.key}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{form.getFieldValue(['semesters', field.name, 'name'])}</strong>
                  <Button danger type="link" onClick={() => remove(field.name)}>
                    Xóa kỳ này
                  </Button>
                </div>

                <Form.Item label="Tên kỳ" name={[field.name, 'name']}>
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Ngày bắt đầu"
                  name={[field.name, 'startDate']}
                  rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                >
                  <DatePicker style={{ width: '100%' }} onChange={d => handleStartChange(idx, d)} />
                </Form.Item>

                <Form.Item
                  label="Ngày kết thúc"
                  name={[field.name, 'endDate']}
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name={[field.name, 'status']}
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select
                    options={[
                      { value: 'Ongoing', label: 'Đang diễn ra' },
                      { value: 'Completed', label: 'Đã hoàn thành' },
                      { value: 'Upcoming', label: 'Sắp diễn ra' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Mô tả" name={[field.name, 'description']}>
                  <Input.TextArea rows={2} placeholder="Mô tả (không bắt buộc)" />
                </Form.Item>
              </div>
            ))}

            {/* ✅ Nút thêm khi trống: Đặt BÊN TRONG hàm */}
            {fields.length === 0 && (
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Select
                    placeholder="Chọn kỳ để thêm"
                    style={{ minWidth: 160 }}
                    onChange={val => add(generateOneSemester(val as SemesterName, year))}
                    options={[
                      { value: 'Spring', label: 'Spring' },
                      { value: 'Summer', label: 'Summer' },
                      { value: 'Fall', label: 'Fall' },
                    ]}
                  />
                </Space>
              </div>
            )}

            {/* (Tuỳ chọn) Hiện lỗi list nếu cần */}
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>

      {/* Nút lưu */}
      <Form.Item style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          htmlType="submit"
          {...saveButtonProps}
          disabled={semesters.length === 0}
        >
          Lưu kỳ học
        </Button>
      </Form.Item>
    </Form>
  );
};
