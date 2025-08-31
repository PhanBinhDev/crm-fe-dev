import { Create } from '@refinedev/antd';
import { useDataProvider, useInvalidate } from '@refinedev/core';
import { App, Card, Form } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SemesterForm from '../components/form';

interface ISemesterCreateDTO {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  description?: string;
  blocks?: { name: string }[];
}

const RESOURCE = 'semesters';

export const SemesterCreatePage: React.FC = () => {
  const getDataProvider = useDataProvider();
  const dataProvider = getDataProvider();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const invalidate = useInvalidate();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [form] = Form.useForm();

  const handleFinish = async (items: ISemesterCreateDTO[]) => {
    setServerError(null);

    const invalids: string[] = [];
    for (const i of items) {
      if (!i.name) invalids.push('Tên kỳ học trống');
      if (!i.year) invalids.push('Năm không hợp lệ');
      if (!i.startDate || !i.endDate) invalids.push(`Kỳ ${i.name} thiếu ngày`);
      if (!i.status) invalids.push(`Kỳ ${i.name} thiếu trạng thái`);
    }

    if (invalids.length > 0) {
      notification.error({
        message: 'Dữ liệu không hợp lệ',
        description: invalids.join('; '),
      });
      return;
    }

    try {
      // gọi BE
      for (const payload of items) {
        await dataProvider.create({
          resource: RESOURCE,
          variables: payload,
        });
      }

      notification.success({
        message: 'Thêm mới thành công',
        description: `Đã tạo ${items.length} kỳ học cho năm ${items[0].year}`,
      });

      form.resetFields();
      invalidate({ resource: RESOURCE, invalidates: ['list'] });
      navigate('/semesters/list');
    } catch (e: any) {
      let msg = e?.message || 'Không thể tạo kỳ học';
      const details = e?.errors?.details || e?.errors?.message || e?.errors;
      if (Array.isArray(details) && details.length) {
        msg = details.map((d: any) => d?.message).join('; ');
      }

      notification.error({
        message: 'Thêm mới thất bại',
        description: msg,
      });

      setServerError(msg);
    }
  };
  return (
    <Create breadcrumb={false} footerButtons={[]} title="Tạo Mới Kỳ Học">
      <Card>
        <SemesterForm formProps={{ form, onFinish: handleFinish }} serverError={serverError} />
      </Card>
    </Create>
  );
};
