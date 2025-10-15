import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName } from '@/utils/activity';
import { TeamOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const { Text } = Typography;

const WorkspacesSettings = () => {
  const { workspaces, currentWorkspace } = useWorkspaces();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { openModal } = useModal();

  const handleError = () => {
    setImgError(true);
    return false;
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      {workspaces.length > 1 ? (
        <Card
          title={
            <Space>
              <Text style={{ fontSize: 20 }}>
                Không gian làm việc của bạn ({workspaces.length})
              </Text>
            </Space>
          }
          bordered={false}
        >
          <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8, marginBottom: 8 }}>
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
                  {currentWorkspace?.avatar && !imgError ? (
                    <Avatar src={currentWorkspace?.avatar} size={48} onError={handleError} />
                  ) : (
                    <Avatar
                      size={48}
                      style={{ background: getColorFromName(currentWorkspace?.name) }}
                    >
                      {currentWorkspace?.name.charAt(0).toUpperCase()}
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
                  {currentWorkspace?.visibility}
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
                      {workspace.avatar && !imgError ? (
                        <Avatar src={workspace.avatar} size={48} onError={handleError} />
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
                      {workspace.visibility}
                    </Tag>
                  </div>
                ))}
            </Space>
          </div>

          <Divider />

          <Button
            type="dashed"
            block
            icon={<TeamOutlined />}
            onClick={() => openModal('ModalAddWorkspace')}
          >
            Tạo workspace mới
          </Button>
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

      <Card title="Lời mời tham gia" bordered={false}>
        <div
          style={{
            padding: 16,
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>Marketing Team</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Nguyễn Văn B đã mời bạn tham gia</div>
            </div>
            <Space>
              <Button size="small">Từ chối</Button>
              <Button type="primary" size="small">
                Chấp nhận
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </Space>
  );
};

export default WorkspacesSettings;
