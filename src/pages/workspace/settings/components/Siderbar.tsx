import {
  LockOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, useParams } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const { workspaceId } = useParams();
  return (
    <Sider
      width={220}
      style={{ background: '#fff', height: '100%', borderRight: '1px solid #f0f0f0' }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={['general']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="general" icon={<UserOutlined />}>
          <Link to={`/workspaces/${workspaceId}/settings/general`}>Chung</Link>
        </Menu.Item>
        <Menu.Item key="member" icon={<UsergroupAddOutlined />}>
          <Link to={`/workspaces/${workspaceId}/settings/member`}>Thành viên</Link>
        </Menu.Item>
        <Menu.Item key="security" icon={<LockOutlined />}>
          <Link to={`/workspaces/${workspaceId}/settings/security`}>Bảo mật</Link>
        </Menu.Item>
        <Menu.Item key="appearance" icon={<SettingOutlined />}>
          <Link to={`/workspaces/${workspaceId}/settings/appearance`}>Hình thức</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
