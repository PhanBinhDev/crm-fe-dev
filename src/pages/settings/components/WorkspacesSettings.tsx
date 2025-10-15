import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName } from '@/utils/activity';
import { TeamOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Space, Tag } from 'antd';

const WorkspacesSettings = () => {
  const { workspaces, currentWorkspace, isLoading, switchWorkspace, refreshWorkspaces } =
    useWorkspaces();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {workspaces.length > 1 ? (
        <Card title="Workspaces của bạn" bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {workspaces
              .filter(workspace => workspace.id !== currentWorkspace?.id)
              .map(workspace => (
                <div
                  style={{
                    padding: 16,
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
                      <Avatar src={workspace.avatar} size={48} />
                    ) : (
                      <Avatar
                        size={48}
                        style={{ background: `${getColorFromName(workspace.name)}` }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>{workspace.name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {workspace.membersCount} thành viên • Sở hữu:
                      </div>
                    </div>
                  </div>
                  <Tag
                    color={
                      workspace.visibility && workspace.visibility === 'public' ? 'blue' : 'orange'
                    }
                  >
                    {workspace.visibility}
                  </Tag>
                </div>
              ))}

            <div
              style={{
                padding: 16,
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
                <Avatar size={48} style={{ background: '#52c41a' }}>
                  T
                </Avatar>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>Team Development</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>8 thành viên • Member</div>
                </div>
              </div>
              <Button type="link">Xem chi tiết</Button>
            </div>
          </Space>

          <Divider />

          <Button type="dashed" block icon={<TeamOutlined />}>
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
