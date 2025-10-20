import { IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useInvitationHandlers } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { Button, Card, Space, Typography } from 'antd';
import { useMemo } from 'react';

const { Text } = Typography;

const InvitationList = () => {
  const {
    handleAcceptInvitation,
    handleRejectInvitation,
    loadingId,
    rejectingId,
    hiddenWorkspaceIds,
  } = useInvitationHandlers();
  const { data: dataInvitations, isLoading: isLoadingInvitations } = useList<IWorkspace>({
    resource: 'workspaces/invitations',
    pagination: { mode: 'off' },
    queryOptions: {
      retry: false,
    },
  });

  const invitations = useMemo(() => {
    if (isLoadingInvitations || !dataInvitations) return [];

    return dataInvitations.data.filter(workspace => !hiddenWorkspaceIds.has(workspace.id));
  }, [dataInvitations, isLoadingInvitations, hiddenWorkspaceIds]);

  console.log('Invitations:', invitations);

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
        body: {
          maxHeight: 'calc(100% - 44.8px)',
          overflowY: 'auto',
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
                          workspace?.avatar
                            ? workspace.avatar
                            : `${import.meta.env.VITE_API_BASE_URL}${workspace?.avatar}?t=${workspace?.updatedAt}`
                        }
                      />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 17 }}>{workspace.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>Bạn được mời tham gia</div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        danger
                        loading={rejectingId === workspace.id}
                        onClick={() => handleRejectInvitation(workspace.id)}
                      >
                        Từ chối
                      </Button>
                      <Button
                        type="primary"
                        size="small"
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
