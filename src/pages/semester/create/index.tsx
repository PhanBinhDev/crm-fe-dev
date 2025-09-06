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

    try {
      await form.validateFields();

      const invalids: string[] = [];
      const currentYear = new Date().getFullYear();

      if (!Array.isArray(items) || items.length === 0) {
        invalids.push('Không có kỳ học nào để tạo');
      }

      for (const i of items ?? []) {
        if (!i?.name?.trim()) invalids.push('Tên kỳ học trống');
        if (!Number.isInteger(i.year) || i.year < currentYear) {
          invalids.push(`Năm không hợp lệ (phải ≥ ${currentYear})`);
        }

        if (!i.startDate || !i.endDate) {
          invalids.push(`Kỳ ${i.name || '(không tên)'} thiếu ngày bắt đầu/kết thúc`);
        } else {
          const start = new Date(i.startDate).getTime();
          const end = new Date(i.endDate).getTime();

          if (Number.isNaN(start) || Number.isNaN(end)) {
            invalids.push(`Kỳ ${i.name}: ngày không hợp lệ`);
          } else {
            if (end < start) {
              invalids.push(`Kỳ ${i.name}: ngày kết thúc phải ≥ ngày bắt đầu`);
            }    
          }
        }

        if (!i.status) invalids.push(`Kỳ ${i.name || '(không tên)'} thiếu trạng thái`);
      }

      if (invalids.length > 0) {
        notification.error({
          message: 'Dữ liệu không hợp lệ',
          description: invalids.join('; '),
        });
        return; 
      }

      await Promise.all(
        items.map((payload) =>
          dataProvider.create({ resource: RESOURCE, variables: payload })
        )
      );

      notification.success({
        message: 'Thêm mới thành công',
        description: `Đã tạo ${items.length} kỳ học cho năm ${items[0].year}`,
      });

      form.resetFields();
      invalidate({ resource: RESOURCE, invalidates: ['list'] });
      navigate('/semesters/list');
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.errors?.message ||
        (Array.isArray(e?.errors)
          ? e.errors.map((d: any) => d?.message).join('; ')
          : 'Không thể tạo kỳ học');

      notification.error({
        message: 'Thêm mới thất bại',
        description: msg,
      });

      setServerError(msg);
    }
  };

  return (
    <Create breadcrumb={false} footerButtons={[]} title="Tạo Mới Kỳ Học">
      <SemesterForm formProps={{ form, onFinish: handleFinish }} serverError={serverError} />
    </Create>
  );
};

export default SemesterCreatePage;
