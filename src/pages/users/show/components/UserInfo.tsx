import { FC } from 'react';
import { Descriptions, Avatar, Tag } from 'antd';
import type { IUser } from '@/common/types';
import { UserRole } from '@/common/enum/user';

interface UserInfoProps {
  user: IUser;
}

export const UserInfo: FC<UserInfoProps> = ({ user }) => {
  return (
    <Descriptions bordered>
      <Descriptions.Item label="Avatar" span={3}>
        <Avatar src={'/default.png'} size={64} />
      </Descriptions.Item>

      <Descriptions.Item label="Họ tên" span={2}>
        {user.name}
      </Descriptions.Item>

      <Descriptions.Item label="Email">{user.email}</Descriptions.Item>

      <Descriptions.Item label="Vai trò">
        <Tag color={user.role === UserRole.GV ? 'blue' : 'default'}>{user.role.toUpperCase()}</Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Trạng thái">
        <Tag color={user.isActive ? 'success' : 'error'}>
          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Ngày tạo">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </Descriptions.Item>

      <Descriptions.Item label="Cập nhật lần cuối">
        {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
      </Descriptions.Item>
    </Descriptions>
  );
};
