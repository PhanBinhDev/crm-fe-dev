import { Edit, useForm, RefreshButton } from '@refinedev/antd';
import { Card } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { IUser, User } from '@/common/types';
import { useGetIdentity } from '@refinedev/core';
import { useParams } from 'react-router-dom';

export const UserEdit = () => {
  const { formProps, saveButtonProps } = useForm<IUser>();
  const { data: identity } = useGetIdentity<User>();
  const { id } = useParams();

  const handleFinish = async (values: any) => {
    if (formProps.onFinish) {
      formProps.onFinish(values);
    }
  };

  const isSelfEdit = identity?.id === id;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Edit
        saveButtonProps={{
          ...saveButtonProps,
          children: 'Lưu',
        }}
        title="Chỉnh sửa người dùng"
        breadcrumb={false}
        headerButtons={({ refreshButtonProps }) => (
          <>
            <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
          </>
        )}
      >
        <Card bodyStyle={{ padding: '32px 24px' }}>
          <UserForm
            onFinish={handleFinish}
            initialValues={formProps.initialValues as IUser}
            isEdit={true}
            isSelfEdit={isSelfEdit}
          />
        </Card>
      </Edit>
    </div>
  );
};
