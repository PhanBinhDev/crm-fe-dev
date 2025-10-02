import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useDelete, useList, useOne, useUpdate } from '@refinedev/core';
import { IconTrash } from '@tabler/icons-react';
import { Button, Popconfirm, Space, Spin, Switch, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Text } = Typography;

const GeneralSettings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  if (!workspaceId) {
    return (
      <Spin
        tip="Đang tải..."
        style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
    );
  }
  const { user: identity } = useAuth();
  const { data: membersData, isLoading: isLoadingMembers } = useList<IMember>({
    resource: `workspaces/${workspaceId}/members`,
    queryOptions: {
      enabled: !!workspaceId,
    },
  });

  const currentUserRole = (membersData?.data ?? []).find(m => m.user.id === identity?.id)?.role;

  const { data: workspaceData, isLoading } = useOne({
    resource: `workspaces`,
    id: workspaceId,
  });

  const { mutate: updateWorkspace, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteWorkspace, isLoading: isDeleting } = useDelete();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (workspaceData?.data) {
      setChecked(workspaceData.data.visibility === 'private');
    }
  }, [workspaceData]);

  const handleToggle = (value: boolean) => {
    setChecked(value);

    updateWorkspace(
      {
        resource: `workspaces`,
        id: workspaceId,
        values: {
          name: workspaceData?.data.name,
          visibility: value ? 'private' : 'public',
        },
      },
      {
        onSuccess: () => {
          message.success(
            `Không gian làm việc đã chuyển sang chế độ ${value ? 'riêng tư' : 'công khai'}`,
          );
        },
        onError: () => {
          message.error('Có lỗi xảy ra khi cập nhật không gian làm việc');
          setChecked(!value);
        },
      },
    );
  };

  const handleDeleteWorkspace = () => {
    if (currentUserRole !== MemberRole.OWNER) {
      message.error('Bạn không có quyền xóa workspace này.');
      return;
    }

    deleteWorkspace(
      {
        resource: `workspaces`,
        id: workspaceId,
      },
      {
        onSuccess: () => {
          message.success('Không gian làm việc đã được xóa thành công.');
        },
        onError: () => {
          message.error('Xóa không gian làm việc thất bại.');
        },
      },
    );
  };

  if (isLoading || isLoadingMembers) {
    return (
      <Spin
        tip="Đang tải..."
        style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: 20, fontSize: 25 }}>Cài đặt chung</h2>
      <Space
        style={{
          width: '100%',

          display: 'flex',

          justifyContent: 'space-between',

          paddingBottom: 20,

          borderBottom: '1px solid #f0f0f0',

          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16 }}>Chuyển sang không gian làm việc riêng tư</Text>

        <Switch loading={isLoading || isUpdating} checked={checked} onChange={handleToggle} />
      </Space>
      {currentUserRole === MemberRole.OWNER && (
        <Space
          direction="vertical"
          style={{
            width: '100%',
            padding: '15px',
            border: '1px solid #ff4d4f',
            borderRadius: 8,
            background: '#fff0f6',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
              <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>
                Xoá không gian làm việc
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Thao tác này sẽ xóa vĩnh viễn không gian làm việc này và tất cả dữ liệu liên quan.
                Bạn không thể hoàn tác.
              </Text>
            </div>

            <div>
              <Popconfirm
                title="Xác nhận xóa không gian làm việc?"
                description="Bạn có chắc chắn muốn xóa vĩnh viễn không gian làm việc này không? Thao tác này không thể hoàn tác."
                onConfirm={handleDeleteWorkspace}
                okText="Xóa vĩnh viễn"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: isDeleting }}
                placement="bottomLeft"
              >
                <Button
                  danger
                  loading={isDeleting}
                  icon={<IconTrash size={16} />}
                  style={{ marginTop: 0 }}
                >
                  Xóa Workspace
                </Button>
              </Popconfirm>
            </div>
          </div>
        </Space>
      )}
    </div>
  );
};

export default GeneralSettings;
