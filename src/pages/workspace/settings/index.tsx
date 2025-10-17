import { Layout } from 'antd';
import { NavLink, Outlet } from 'react-router-dom';

const { Content } = Layout;

const tabMenuItems = [
  { key: 'general', label: 'Chung', path: '/workspaces/:workspaceId/settings/general' },
  { key: 'member', label: 'Thành viên', path: '/workspaces/:workspaceId/settings/member' },
  { key: 'security', label: 'Bảo mật', path: '/workspaces/:workspaceId/settings/security' },
  { key: 'appearance', label: 'Hình thức', path: '/workspaces/:workspaceId/settings/appearance' },
];

const SettingsWorkspaces = () => {
  return (
    <Layout style={{ background: '#fff', minHeight: '100%', height: 'inherit' }}>
      <div style={{ padding: '20px 20px 0', borderBottom: '1px solid #f0f0f0' }}>
        <nav className="settings-tabs" style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
          {tabMenuItems.map(item => (
            <NavLink
              key={item.key}
              to={item.path.replace(':workspaceId', 'workspaceId')}
              className={({ isActive }) => (isActive ? 'active' : '')}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: isActive ? 'bold' : 'normal',
                borderBottom: isActive ? '2px solid #6c63ff' : 'none',
                paddingBottom: '5px',
                color: isActive ? '#6c63ff' : '#000',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Content style={{ padding: '10px 20px' }}>
        <div style={{ margin: '0 auto', height: '100%' }}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
            <Outlet />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default SettingsWorkspaces;
