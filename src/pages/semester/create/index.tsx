import { Create, useForm } from '@refinedev/antd';
import { Card } from 'antd';
import { ISemester } from '@/common/types/semester';
import SemesterForm from './../components/form/index';

export const SemesterCreatePage = () => {
  // Lấy formProps và saveButtonProps từ useForm
  const { formProps } = useForm<ISemester>({
    resource: 'semesters',
  });

  return (
    <Create breadcrumb={false}>
   <Card>
      <SemesterForm {...formProps} />
   </Card>
   
</Create>

  );
};
