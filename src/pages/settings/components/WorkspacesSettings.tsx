import InvitationList from '@/components/shared/InvitationList';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { Avatar, Card, Space, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Text } = Typography;

const WorkspacesSettings = () => {
  const { workspaces, currentWorkspace } = useWorkspaces();
  const navigate = useNavigate();
  const { openModal } = useModal();

  return (
    <div
      style={{
        padding: 12,
      }}
    >
      <InvitationList />
      {workspaces.length > 1 ? (
        <Card
          title={
            <Text style={{ fontSize: 17 }}>Tất cả ({workspaces?.length || 'Chưa cập nhật'})</Text>
          }
          size="small"
          style={{ padding: 5 }}
        >
          <div style={{ paddingRight: 8, marginBottom: 8 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div
                style={{
                  padding: '10px 16px',
                  background: '#fafafa',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {currentWorkspace?.avatar ? (
                    <Avatar
                      src={
                        currentWorkspace?.avatar &&
                        `${import.meta.env.VITE_API_BASE_URL}${currentWorkspace?.avatar}?t=${currentWorkspace?.updatedAt}`
                      }
                      size={48}
                      style={{ background: getColorFromName(currentWorkspace?.name) }}
                    >
                      {getInitials(currentWorkspace?.name)}
                    </Avatar>
                  ) : (
                    <Avatar
                      size={48}
                      style={{ background: getColorFromName(currentWorkspace?.name) }}
                    >
                      {getInitials(currentWorkspace?.name)}
                    </Avatar>
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 17,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/workspaces/${currentWorkspace?.id}`)}
                    >
                      {currentWorkspace?.name}
                      <span style={{ fontSize: 12, color: '#1890ff', marginLeft: 10 }}>
                        Đang hoạt động
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {currentWorkspace?.membersCount} thành viên • Sở hữu:
                    </div>
                  </div>
                </div>
                <Tag
                  color={
                    currentWorkspace?.visibility && currentWorkspace?.visibility === 'public'
                      ? 'blue'
                      : 'orange'
                  }
                >
                  {currentWorkspace?.visibility === 'private' ? 'Riêng tư' : 'Công khai'}
                </Tag>
              </div>

              {workspaces
                .filter(workspace => workspace.id !== currentWorkspace?.id)
                .map(workspace => (
                  <div
                    key={workspace.id}
                    style={{
                      padding: '10px 16px',
                      background: '#fafafa',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {workspace.avatar ? (
                        <Avatar
                          src={
                            workspace?.avatar &&
                            `${import.meta.env.VITE_API_BASE_URL}${workspace?.avatar}?t=${currentWorkspace?.updatedAt}`
                          }
                          size={48}
                          style={{ background: getColorFromName(workspace?.name) }}
                        >
                          {workspace?.name.charAt(0).toUpperCase()}
                        </Avatar>
                      ) : (
                        <Avatar size={48} style={{ background: getColorFromName(workspace.name) }}>
                          {workspace.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <div>
                        <div
                          style={{ fontWeight: 500, fontSize: 17, cursor: 'pointer' }}
                          onClick={() => navigate(`/workspaces/${workspace.id}`)}
                        >
                          {workspace.name}
                        </div>

                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {workspace.membersCount} thành viên • Sở hữu:
                        </div>
                      </div>
                    </div>
                    <Tag
                      color={
                        workspace.visibility && workspace.visibility === 'public'
                          ? 'blue'
                          : 'orange'
                      }
                    >
                      {workspace?.visibility === 'private' ? 'Riêng tư' : 'Công khai'}
                    </Tag>
                  </div>
                ))}
            </Space>
          </div>
        </Card>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            color: '#888',
            background: '#f5f5f5',
            borderRadius: 6,
          }}
        >
          Không còn workspace nào khác.
        </div>
      )}
    </div>
  );
};

export default WorkspacesSettings;
