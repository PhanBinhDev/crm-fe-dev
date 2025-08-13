import { Edit, useForm, RefreshButton } from '@refinedev/antd';
import { Card } from 'antd';

import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ISemester } from '@/common/types/semester';
import SemesterForm from '../form/components/SemesterForm';

export const SemesterEdit = () => {
  const { formProps, saveButtonProps } = useForm<ISemester>();
  const { user: identity } = useAuth();
  const { id } = useParams();

  const handleFinish = async (values: any) => {
    if (formProps.onFinish) {
      formProps.onFinish(values);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Edit
        saveButtonProps={{
          ...saveButtonProps,
          style: { display: 'none' },
        }}
        title="Chỉnh sửa kỳ học"
        breadcrumb={false}
        headerButtons={[]}
      >
        <Card style={{ padding: '32px 24px' }}>
          <SemesterForm
            onFinish={handleFinish}
            isEdit={true}
            initialValues={formProps.initialValues as ISemester}
          />
        </Card>
      </Edit>
    </div>
  );
};
