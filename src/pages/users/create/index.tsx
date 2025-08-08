import { Create, useForm } from '@refinedev/antd';
import { Card } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { IUser } from '@/common/types';

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm<IUser>();

  const handleFinish = async (values: any) => {
    if (formProps.onFinish) {
      await formProps.onFinish(values);
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
        <UserForm onFinish={handleFinish} isEdit={false} isSelfEdit={false} />
      </Card>
    </Create>
  );
};
