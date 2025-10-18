import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useDelete, useInvalidate, useList, useUpdate } from '@refinedev/core';
import { IconBrightnessAuto, IconDots, IconTrash } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  Input,
  MenuProps,
  Modal,
  Spin,
  Table,
  Tooltip,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import WorkspaceInfo from './WorkspaceInfo';
import WorkspaceSettingsInner from './WorkspaceSettingsInner';

type WorkspaceTab = 'info' | 'members' | 'settings';

const ManageWorkspace = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('info');
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading, isError } = useList<IMember>({
    resource: workspaceId ? `workspaces/${workspaceId}/members` : '',
    queryOptions: { enabled: activeTab === 'members' && !!workspaceId, retry: false },
  });

  const members: IMember[] = useMemo(() => {
    if (!data) return [];
    const raw = data as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  }, [data]);

  const invalidate = useInvalidate();
  const { mutate: deleteMember } = useDelete();
  const { mutate: updateMember } = useUpdate();

  const handleDeleteMember = (id: string) => {
    const hide = message.loading('Đang xoá thành viên...', 0);
    deleteMember(
      { resource: `workspaces/${workspaceId}/members`, id },
      {
        onSuccess: () => {
          hide();
          message.success('Xoá thành viên thành công');
          invalidate({ resource: `workspaces/${workspaceId}/members`, invalidates: ['list'] });
        },
        onError: () => {
          hide();
          message.error('Xoá thành viên thất bại');
        },
      },
    );
  };

  const handleChangeRole = (id: string, role: MemberRole) => {
    const hide = message.loading('Đang cập nhật vai trò...', 0);
    updateMember(
      {
        resource: `workspaces/${workspaceId}/members/${id}/role`,
        id: '',
        values: { role },
        meta: { custom: true },
      },
      {
        onSuccess: () => {
          hide();
          message.success('Cập nhật vai trò thành công');
          invalidate({ resource: `workspaces/${workspaceId}/members`, invalidates: ['list'] });
        },
        onError: () => {
          hide();
          message.error('Cập nhật vai trò thất bại');
        },
      },
    );
  };


  const renderMembersTab = () => {
    if (isLoading) {
      return (
        <div
          style={{
            width: '100%',
            height: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      );
    }

    if (isError) {
      return <Empty description="Không thể tải danh sách thành viên. Vui lòng thử lại sau." />;
    }

    if (!members.length) {
      return <Empty description="Trống" style={{ marginTop: 40 }} />;
    }

    const columns = [
      {
        title: 'Tên',
        dataIndex: ['user', 'name'],
        key: 'name',
        render: (_: any, record: IMember) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={36}
              src={record.user.avatar}
              style={{
                backgroundColor: getColorFromName(record.user.name),
                color: '#fff',
                fontWeight: 600,
              }}
            >
              {getInitials(record.user.name)}
            </Avatar>
            <span style={{ fontWeight: 600 }}>{record.user.name}</span>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: ['user', 'email'],
        key: 'email',
        render: (email: string) => <span style={{ color: '#555' }}>{email}</span>,
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => (
          <span style={{ color: '#777' }}>{dayjs(date).format('DD/MM/YYYY')}</span>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role: IMember['role']) => (
          <Tooltip title={`Vai trò: ${role}`}>
            <span
              style={{
                padding: '4px 8px',
                background: '#f5f5f5',
                borderRadius: 6,
                fontSize: 12,
                color: '#555',
              }}
            >
              {role === MemberRole.OWNER
                ? 'Chủ sở hữu'
                : role === MemberRole.ADMIN
                  ? 'Admin'
                  : 'Member'}
            </span>
          </Tooltip>
        ),
      },
      {
        title: 'Action',
        key: 'actions',
        width: 60,
        align: 'right' as const,
        render: (_: any, record: IMember) => {
          if (record.role === MemberRole.OWNER) return null;

          const items: MenuProps['items'] = [
            {
              key: `toggle-${record.id}`,
              icon: <IconBrightnessAuto color="#1890ff" size={18} />,
              label:
                record.role === MemberRole.MEMBER ? 'Đặt vai trò Admin' : 'Đặt vai trò Thành viên',
              onClick: () =>
                handleChangeRole(
                  record.id,
                  record.role === MemberRole.MEMBER ? MemberRole.ADMIN : MemberRole.MEMBER,
                ),
            },
            {
              key: `delete-${record.id}`,
              icon: <IconTrash color="#ff4d4f" size={18} />,
              label: 'Xoá thành viên',
              onClick: () => {
                Modal.confirm({
                  title: 'Xác nhận xoá thành viên',
                  content: `Bạn có chắc muốn xoá ${record.user.name} khỏi workspace?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Huỷ',
                  onOk: () => handleDeleteMember(record.id),
                });
              },
            },
          ];

          return (
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<IconDots size={18} />} />
            </Dropdown>
          );
        },
      },
    ];

    return (
      <div style={{ padding: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button
              type="default"
              style={{
                borderRadius: 6,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                height: 28,
              }}
            >
              Hoạt động <span style={{ marginLeft: 4, color: '#999' }}>{members.length}</span>
            </Button>
            <Button
              type="default"
              style={{
                borderRadius: 6,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                height: 28,
              }}
            >
              Đã mời <span style={{ marginLeft: 4, color: '#999' }}>0</span>
            </Button>
            <Input
              placeholder="Tìm kiếm thành viên"
              style={{
                width: 180,
                height: 28,
                borderRadius: 6,
              }}
            />
            <Button
              type="default"
              style={{
                borderRadius: 6,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                height: 28,
              }}
            >
              Tất cả vai trò
            </Button>
          </div>

          <Button
            type="primary"
            style={{
              borderRadius: 6,
              height: 30,
            }}
          >
            + Mời thành viên
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={false}
          style={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
          }}
        />
      </div>
    );
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <WorkspaceInfo onFormChange={() => {}} onUpdate={() => {}} />;
      case 'members':
        return renderMembersTab();
      case 'settings':
        return <WorkspaceSettingsInner />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 12,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            onClick={() => setActiveTab('info')}
            style={{
              background: activeTab === 'info' ? '#f1f1f1' : 'transparent',
              color: '#222',
              boxShadow: activeTab === 'info' ? '0 1px 4px rgba(0,0,0,0.04)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 500,
            }}
          >
            Thông tin workspace
          </Button>

          <Button
            type="text"
            onClick={() => setActiveTab('members')}
            style={{
              background: activeTab === 'members' ? '#f1f1f1' : 'transparent',
              color: '#222',
              boxShadow: activeTab === 'members' ? '0 1px 4px rgba(0,0,0,0.04)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 500,
            }}
          >
            Thành viên
          </Button>

          <Button
            type="text"
            onClick={() => setActiveTab('settings')}
            style={{
              background: activeTab === 'settings' ? '#f1f1f1' : 'transparent',
              color: '#222',
              boxShadow: activeTab === 'settings' ? '0 1px 4px rgba(0,0,0,0.04)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 500,
            }}
          >
            Cài đặt
          </Button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: 10,
          padding: 12,
          transition: 'all 0.3s',
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ManageWorkspace;
