import { IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useCustomMutation, useInvalidate, useList } from '@refinedev/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, Card, message, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

const { Text } = Typography;

const InvitationList = () => {
  const { data: dataInvitations, isLoading: isLoadingInvitations } = useList<IWorkspace>({
    resource: 'workspaces/invitations',
    pagination: { mode: 'off' },
    queryOptions: {
      retry: false,
    },
  });
  const invalidate = useInvalidate();
  const { mutate: acceptInvitation } = useCustomMutation();
  const { mutate: rejectInvitation } = useCustomMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [hiddenWorkspaceIds, setHiddenWorkspaceIds] = useState<Set<string>>(new Set());

  const invitations = useMemo(() => {
    if (isLoadingInvitations || !dataInvitations) return [];

    return dataInvitations.data.filter(workspace => !hiddenWorkspaceIds.has(workspace.id));
  }, [dataInvitations, isLoadingInvitations, hiddenWorkspaceIds]);

  const handleAcceptInvitation = (workspaceId: string) => {
    setHiddenWorkspaceIds(prev => new Set(prev).add(workspaceId));
    setLoadingId(workspaceId);

    acceptInvitation(
      {
        method: 'post',
        url: `workspaces/${workspaceId}/accept-invitation`,
        values: {},
      },
      {
        onSuccess: () => {
          message.success('Đã chấp nhận lời mời');
          invalidate({ resource: 'workspaces/invitations', invalidates: ['list'] });
          invalidate({ resource: 'workspaces', invalidates: ['list'] });
        },
        onError: () => {
          message.error('Không thể chấp nhận lời mời');
          setHiddenWorkspaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(workspaceId);
            return newSet;
          });
        },
        onSettled: () => {
          setLoadingId(null);
        },
      },
    );
  };

  const handleRejectInvitation = (workspaceId: string) => {
    setHiddenWorkspaceIds(prev => new Set(prev).add(workspaceId));
    setRejectingId(workspaceId);

    rejectInvitation(
      {
        method: 'post',
        url: `workspaces/${workspaceId}/reject-invitation`,
        values: {},
      },
      {
        onSuccess: () => {
          message.success('Đã từ chối lời mời');
          invalidate({ resource: 'workspaces/invitations', invalidates: ['list'] });
        },
        onError: () => {
          message.error('Không thể từ chối lời mời');
          setHiddenWorkspaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(workspaceId);
            return newSet;
          });
        },
        onSettled: () => {
          setRejectingId(null);
        },
      },
    );
  };

  return (
    <Card
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 17, paddingLeft: 6 }}>
            Lời mời tham gia ({invitations.length})
          </Text>
          <Button
            type="link"
            style={{
              color: '#333',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Xem tất cả
          </Button>
        </div>
      }
      size="small"
      style={{
        width: '100%',
        flex: 2,
        minWidth: 0,
        maxHeight: 'fit-content',
      }}
      styles={{
        header: {
          padding: '6px 8px',
        },
      }}
    >
      <div style={{ marginBottom: 8, borderRadius: 8 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {isLoadingInvitations ? (
            <div
              style={{
                width: '100%',
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: '#f9f9f9',
                borderRadius: 8,
              }}
            >
              <Spinner size={20} />
            </div>
          ) : (
            <>
              {invitations.length > 0 ? (
                invitations.map(workspace => (
                  <div
                    key={workspace.id}
                    style={{
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f9f9f9')}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <CustomAvatar
                        name={workspace.name}
                        src={
                          workspace?.avatar &&
                          `${import.meta.env.VITE_API_BASE_URL}${workspace?.avatar}?t=${workspace?.updatedAt}`
                        }
                      />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 17 }}>{workspace.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Bạn được mời tham gia • {dayjs(workspace.createdAt).fromNow()}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        danger
                        icon={<IconX size={14} />}
                        loading={rejectingId === workspace.id}
                        onClick={() => handleRejectInvitation(workspace.id)}
                      >
                        Từ chối
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        icon={<IconCheck size={14} />}
                        loading={loadingId === workspace.id}
                        onClick={() => handleAcceptInvitation(workspace.id)}
                      >
                        Chấp nhận
                      </Button>
                    </Space>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: '#f9f9f9',
                    borderRadius: 8,
                  }}
                >
                  <Text type="secondary">Không có lời mời nào</Text>
                </div>
              )}
            </>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default InvitationList;
