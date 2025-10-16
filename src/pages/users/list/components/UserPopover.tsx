import { useOne } from '@refinedev/core';
import { IconMail, IconUser } from '@tabler/icons-react';
import { Avatar, Popover, Space, Spin, Typography } from 'antd';

const { Text } = Typography;

export const UserPopover = ({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useOne({
    resource: 'users',
    id: userId,
    queryOptions: { enabled: !!userId },
  });
  const user = data?.data;

  const content = isLoading ? (
    <div style={{ textAlign: 'center', padding: 16 }}>
      <Spin />
    </div>
  ) : !user ? (
    <div style={{ padding: 16 }}>Không tìm thấy người dùng</div>
  ) : (
    <div style={{ minWidth: 240 }}>
      <Space align="start" size={12}>
        <Avatar size={56} src={user.avatar} icon={<IconUser />} />
        <div>
          <Text strong style={{ fontSize: 15 }}>
            {user.name}
          </Text>
          <div style={{ fontSize: 13, color: '#666' }}>
            {user.major || 'Chưa cập nhật chuyên ngành'}
          </div>
          <div
            style={{ fontSize: 13, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <IconMail size={14} color="#999" />
            <span>{user.email}</span>
          </div>
        </div>
      </Space>
    </div>
  );

  return (
    <Popover placement="rightTop" content={content} trigger="click">
      <span style={{ cursor: 'pointer' }}>{children}</span>
    </Popover>
  );
};
