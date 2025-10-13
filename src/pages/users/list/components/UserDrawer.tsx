import type { IUser } from '@/common/types';
import { getUserRoleLabel } from '@/utils';
import { useOne } from '@refinedev/core';
import {
  IconCalendar,
  IconClock,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCircle,
  IconUserShield,
} from '@tabler/icons-react';
import { Avatar, Card, Drawer, Result, Space, Spin, Tabs, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

export const UserDrawer: React.FC<{
  id: string | null;
  open: boolean;
  onClose: () => void;
}> = ({ id, open, onClose }) => {
  const { data, isLoading } = useOne<IUser>({
    resource: 'users',
    id: id || '',
    queryOptions: { enabled: !!id },
  });

  const user = data?.data;

  return (
    <Drawer
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      title={null}
      styles={{
        body: { padding: 0, background: '#fafafa' },
      }}
    >
      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : !user ? (
        <Result
          status="404"
          title="Không tìm thấy người dùng"
          subTitle="Người dùng này có thể đã bị xóa hoặc không tồn tại."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div
            style={{
              padding: '16px 20px',
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Avatar
              size={72}
              src={user.avatar}
              icon={<IconUser size={32} />}
              style={{ backgroundColor: '#667EEA' }}
            />
            <div>
              <Title level={5} style={{ marginBottom: 4 }}>
                {user.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Vai trò: {getUserRoleLabel(user.role) || 'Chưa cập nhật'}
              </Text>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 20px' }}>
            <Tabs
              defaultActiveKey="contact"
              size="middle"
              tabBarStyle={{
                marginBottom: 12,
                padding: '0 12px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #f0f0f0',
              }}
              items={[
                {
                  key: 'contact',
                  label: (
                    <Space
                      styles={{
                        item: {
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <IconUser size={18} stroke={1.5} />
                      <span>Thông tin liên hệ</span>
                    </Space>
                  ),
                  children: (
                    <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 24 } }}>
                      <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <InfoItem
                          icon={<IconMail size={18} color="#667EEA" />}
                          label="Email"
                          value={user.email}
                        />
                        <InfoItem
                          icon={<IconPhone size={18} color="#667EEA" />}
                          label="Số điện thoại"
                          value={user.phone}
                        />
                        <InfoItem
                          icon={<IconUserCircle size={18} color="#667EEA" />}
                          label="Username"
                          value={user.username || '-'}
                        />
                        <InfoItem
                          icon={<IconCalendar size={18} color="#667EEA" />}
                          label="Ngày sinh"
                          value={
                            user.dateOfBirth
                              ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                              : '-'
                          }
                        />
                        <InfoItem
                          icon={<IconUserShield size={18} color="#667EEA" />}
                          label="Chuyên ngành"
                          value={user.major || '-'}
                        />
                      </Space>
                    </Card>
                  ),
                },
                {
                  key: 'account',
                  label: (
                    <Space
                      styles={{
                        item: {
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <IconCalendar size={18} stroke={1.5} />
                      <span>Thông tin tài khoản</span>
                    </Space>
                  ),
                  children: (
                    <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 24 } }}>
                      <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <InfoItem
                          icon={<IconCalendar size={18} color="#667EEA" />}
                          label="Ngày tạo tài khoản"
                          value={
                            user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : '-'
                          }
                        />
                        <InfoItem
                          icon={<IconClock size={18} color="#667EEA" />}
                          label="Cập nhật lần cuối"
                          value={
                            user.updatedAt
                              ? new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : '-'
                          }
                        />
                      </Space>
                    </Card>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: 500, color: '#1F2937' }}>{value || '-'}</Text>
    </div>
  </div>
);
