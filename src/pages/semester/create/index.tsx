import { Create, useForm } from '@refinedev/antd';
import { Card, message } from 'antd';
import dayjs from 'dayjs';

import { ISemester } from '@/common/types/semester';
import SemesterForm from '../form/components/SemesterForm';

export const SemesterCreate = () => {
  const { formProps, saveButtonProps } = useForm<Omit<ISemester, 'id'>>();

  const handleFinish = (values: any) => {
    try {
      if (!values.name || !values.startDate || !values.endDate) {
        message.error("Vui lòng nhập đủ Tên, Ngày bắt đầu và Ngày kết thúc");
        return;
      }

      const start = dayjs(values.startDate);
      const end = dayjs(values.endDate);

      if (!start.isValid() || !end.isValid()) {
        message.error("Ngày bắt đầu/kết thúc không hợp lệ");
        return;
      }

      if (end.isBefore(start)) {
        message.error("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }

      const payload = {
        name: values.name,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        description: values.description || '',
        year: start.year(),
        status: values.status || 'Upcoming',
        blocks: [
          { name: 'Block 1' },
          { name: 'Block 2' },
        ],
      };

      console.log("Payload gửi lên:", payload);

      formProps.onFinish?.(payload);
    } catch (error) {
      console.error('Error submitting semester:', error);
      message.error("Có lỗi khi gửi dữ liệu");
    }
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        style: { display: 'none' },
      }}
      breadcrumb={false}
      title="Tạo mới kỳ học"
    >
      <Card>
        <SemesterForm
          onFinish={handleFinish}
          isEdit={false}
          formProps={formProps}
        />
      </Card>
    </Create>
  );
};
