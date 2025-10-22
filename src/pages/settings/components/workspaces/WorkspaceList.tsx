import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const WorkspacesList = () => {
  const navigate = useNavigate();
  const { workspaces, isLoading } = useWorkspaces();

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
            Danh sách workspaces ({workspaces.length})
          </Text>
          <Button type="link" />
        </div>
      }
      size="small"
      style={{
        width: '100%',
        flex: 3,
        minWidth: 0,
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        header: {
          padding: '6px 8px',
          minHeight: 44.8,
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        },
        body: {
          maxHeight: 'calc(100% - 44.8px)',
          overflowY: 'auto',
        },
      }}
    >
      <div
        style={{
          marginBottom: 8,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {isLoading ? (
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
            {workspaces.length > 0 ? (
              workspaces.map(workspace => (
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
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9f9f9')}
                  onClick={() => navigate(`/settings/workspaces/${workspace.id}`)}
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
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 16,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {workspace.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                        {workspace.membersCount ?? 0} thành viên
                        <span style={{ margin: '0 6px' }}>·</span>
                        <>
                          Chủ sở hữu: <b>{workspace.ownerName}</b>
                        </>
                      </div>
                    </div>
                  </div>
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
      </div>
    </Card>
  );
};

export default WorkspacesList;
