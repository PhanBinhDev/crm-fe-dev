import { Layout } from 'antd';
import Sidebar from './components/Siderbar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const SettingsWorkspaces = () => {
  return (
    <Layout style={{ background: '#fff', minHeight: '100%', height: "100%" }}>
      <Sidebar />
     <Content style={{ padding: '24px 40px' }}>
  <div style={{ maxWidth: 800, margin: '0 auto', height: "100%" }}>
    <Outlet />   {/* Outlet để render các trang con */}
  </div>
</Content>

    </Layout>
  );
};

export default SettingsWorkspaces;
