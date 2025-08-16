import { Create, useForm } from '@refinedev/antd';
import { Card } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { IUser } from '@/common/types';

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm<IUser>();

  const handleFinish = (values: any) => {
    if (formProps.onFinish) {
      formProps.onFinish(values);
    }
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        children: 'Tạo mới',
      }}
      breadcrumb={false}
    >
      <Card>
        <UserForm
          initialValues={undefined}
          onFinish={handleFinish}
          isEdit={false}
          isSelfEdit={false}
          formProps={formProps}
        />
      </Card>
    </Create>
  );
};
