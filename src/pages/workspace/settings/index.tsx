import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Siderbar';

const { Content } = Layout;

const SettingsWorkspaces = () => {
  return (
    <Layout style={{ background: '#fff', minHeight: '100%', height: 'inherit' }}>
      <Sidebar />
      <Content style={{ padding: '10px 20px' }}>
        <div style={{ margin: '0 auto', height: '100%' }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default SettingsWorkspaces;
