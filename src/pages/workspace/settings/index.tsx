import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Siderbar';

const { Content } = Layout;

const SettingsWorkspaces = () => {
  return (
    <Layout style={{ background: '#fff', minHeight: '100%', height: '100%' }}>
      <Sidebar />
      <Content style={{ padding: '10px 20px' }}>
        <div style={{ margin: '0 auto', height: '100%' }}>
          <Outlet /> {/* Outlet để render các trang con */}
        </div>
      </Content>
    </Layout>
  );
};

export default SettingsWorkspaces;
