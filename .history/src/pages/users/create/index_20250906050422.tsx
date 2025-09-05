
import { Create, useForm } from '@refinedev/antd';
import { Card, message } from 'antd';
import { UserForm } from '@/pages/users/form/components/UserForm';
import { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/api/user';
import { UserRole } from '@/common/enum/user';

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm<IUser>();
  const { user: identity } = useAuth();

  // Chỉ CNBM mới được tạo user
  const isCNBM = identity?.role === UserRole.CNBM;

  const handleFinish = async (values: any) => {
    if (!isCNBM) {
      message.error('Bạn không có quyền tạo người dùng mới!');
      return;
    }

   
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      
      ...(values.username && { username: values.username }),
      ...(values.isActive !== undefined && { isActive: values.isActive === true || values.isActive === 'true' }),
      ...(values.dateOfBirth && { dateOfBirth: typeof values.dateOfBirth === 'string' ? values.dateOfBirth : values.dateOfBirth.format('YYYY-MM-DD') }),
      ...(values.avatar && { avatar: values.avatar }),
      ...(values.major && { major: values.major }),
    };

    try {
      await UserService.createUser(payload);
      message.success('Tạo người dùng thành công!');
      if (formProps.form) formProps.form.resetFields();
    } catch (error: any) {
      // Xử lý lỗi chi tiết từ BE
      const details = error?.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach((d: any) => {
          message.error(`${d.field}: ${d.message}`);
        });
      } else if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Tạo người dùng thất bại!');
      }
    }
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        children: 'Tạo mới',
        disabled: !isCNBM,
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
