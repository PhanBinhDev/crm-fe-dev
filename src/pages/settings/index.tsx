import {
  BellOutlined,
  CameraOutlined,
  CloseOutlined,
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  message,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  TimePicker,
  Upload,
} from 'antd';
import { useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const menuItems = [
    { key: 'general', icon: <UserOutlined />, label: 'Thông tin chung' },
    { key: 'account', icon: <LockOutlined />, label: 'Tài khoản & Bảo mật' },
    { key: 'workspaces', icon: <TeamOutlined />, label: 'Workspaces' },
    { key: 'notifications', icon: <BellOutlined />, label: 'Thông báo' },
    { key: 'preferences', icon: <GlobalOutlined />, label: 'Tùy chọn hiển thị' },
  ];

  const handleSave = () => {
    message.success('Đã lưu thay đổi thành công!');
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
    message.info('Đã hoàn tác thay đổi');
  };

  const GeneralSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Thông tin cá nhân" bordered={false}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            />
            <Upload showUploadList={false}>
              <Button icon={<CameraOutlined />} style={{ marginTop: 12 }} size="small">
                Thay đổi
              </Button>
            </Upload>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Họ và tên</label>
                </div>
                <Input
                  placeholder="Nhập họ tên"
                  prefix={<UserOutlined />}
                  defaultValue="Nguyễn Văn A"
                  onChange={() => setHasChanges(true)}
                />
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Chức vụ</label>
                </div>
                <Input
                  placeholder="Nhập chức vụ"
                  defaultValue="Senior Developer"
                  onChange={() => setHasChanges(true)}
                />
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Email</label>
                </div>
                <Input
                  placeholder="Nhập email"
                  prefix={<MailOutlined />}
                  defaultValue="nguyenvana@company.com"
                  onChange={() => setHasChanges(true)}
                />
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Số điện thoại</label>
                </div>
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined />}
                  defaultValue="0123456789"
                  onChange={() => setHasChanges(true)}
                />
              </Col>
              <Col span={24}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500 }}>Giới thiệu</label>
                </div>
                <TextArea
                  rows={3}
                  placeholder="Viết một chút về bản thân..."
                  onChange={() => setHasChanges(true)}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Card title="Thông tin công ty" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Phòng ban</label>
            </div>
            <Select
              placeholder="Chọn phòng ban"
              defaultValue="engineering"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            >
              <Option value="engineering">Phòng Kỹ thuật</Option>
              <Option value="marketing">Phòng Marketing</Option>
              <Option value="sales">Phòng Kinh doanh</Option>
              <Option value="hr">Phòng Nhân sự</Option>
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Mã nhân viên</label>
            </div>
            <Input placeholder="Mã nhân viên" defaultValue="EMP001" disabled />
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const AccountSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Đổi mật khẩu" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Mật khẩu hiện tại</label>
            </div>
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Mật khẩu mới</label>
            </div>
            <Input.Password placeholder="Nhập mật khẩu mới" onChange={() => setHasChanges(true)} />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Xác nhận mật khẩu mới</label>
            </div>
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              onChange={() => setHasChanges(true)}
            />
          </div>
        </Space>
      </Card>

      <Card title="Bảo mật" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Xác thực hai yếu tố (2FA)</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Tăng cường bảo mật cho tài khoản của bạn
              </div>
            </div>
            <Switch onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Đăng nhập bằng sinh trắc học</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Sử dụng vân tay hoặc Face ID</div>
            </div>
            <Switch defaultChecked onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Phiên đăng nhập</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Quản lý các thiết bị đã đăng nhập
              </div>
            </div>
            <Button type="link">Xem chi tiết</Button>
          </div>
        </Space>
      </Card>

      <Card title="Quyền riêng tư" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Hiển thị trạng thái online</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Cho phép người khác biết bạn đang online
              </div>
            </div>
            <Switch defaultChecked onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
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
              <div style={{ fontWeight: 500 }}>Cho phép xem hồ sơ</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Ai có thể xem thông tin cá nhân của bạn
              </div>
            </div>
            <Select defaultValue="team" style={{ width: 150 }} onChange={() => setHasChanges(true)}>
              <Option value="everyone">Mọi người</Option>
              <Option value="team">Trong team</Option>
              <Option value="private">Chỉ mình tôi</Option>
            </Select>
          </div>
        </Space>
      </Card>
    </Space>
  );

  const WorkspacesSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Workspaces của bạn" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
              <Avatar size={48} style={{ background: '#1890ff' }}>
                L
              </Avatar>
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>Long Halo's Workspace</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>15 thành viên • Owner</div>
              </div>
            </div>
            <Tag color="blue">Đang hoạt động</Tag>
          </div>

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
              <Avatar size={48} style={{ background: '#faad14' }}>
                P
              </Avatar>
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>Project Alpha</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>22 thành viên • Admin</div>
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

  const NotificationsSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Thông báo email" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Khi được giao công việc mới
          </Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Khi có bình luận trong công việc của tôi
          </Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Khi công việc của tôi đến hạn
          </Checkbox>
          <Checkbox onChange={() => setHasChanges(true)}>
            Khi có thành viên mới trong workspace
          </Checkbox>
          <Checkbox onChange={() => setHasChanges(true)}>Bản tin hàng tuần</Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Thông báo bảo mật
          </Checkbox>
        </Space>
      </Card>

      <Card title="Thông báo đẩy (Push)" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Kích hoạt thông báo đẩy</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Nhận thông báo trực tiếp trên thiết bị
              </div>
            </div>
            <Switch defaultChecked onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Công việc mới
          </Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Bình luận và đề cập (@)
          </Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Nhắc nhở deadline
          </Checkbox>
          <Checkbox onChange={() => setHasChanges(true)}>Cập nhật từ workspace</Checkbox>
        </Space>
      </Card>

      <Card title="Nhắc nhở công việc" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Nhắc nhở trước deadline</label>
            </div>
            <Select
              defaultValue="1day"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            >
              <Option value="15min">15 phút</Option>
              <Option value="1hour">1 giờ</Option>
              <Option value="1day">1 ngày</Option>
              <Option value="3days">3 ngày</Option>
              <Option value="1week">1 tuần</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Giờ gửi thông báo hàng ngày</label>
            </div>
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Không làm phiền</label>
            </div>
            <Space>
              <TimePicker format="HH:mm" placeholder="Từ" onChange={() => setHasChanges(true)} />
              <span>đến</span>
              <TimePicker format="HH:mm" placeholder="Đến" onChange={() => setHasChanges(true)} />
            </Space>
          </div>
        </Space>
      </Card>

      <Card title="Tần suất thông báo" bordered={false}>
        <Radio.Group
          defaultValue="realtime"
          style={{ width: '100%' }}
          onChange={() => setHasChanges(true)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="realtime">
              <div>
                <div style={{ fontWeight: 500 }}>Thời gian thực</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Nhận thông báo ngay lập tức</div>
              </div>
            </Radio>
            <Radio value="batch">
              <div>
                <div style={{ fontWeight: 500 }}>Gộp theo giờ</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Nhận thông báo mỗi giờ</div>
              </div>
            </Radio>
            <Radio value="daily">
              <div>
                <div style={{ fontWeight: 500 }}>Tóm tắt hàng ngày</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Nhận 1 email tóm tắt mỗi ngày</div>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>
    </Space>
  );

  const PreferencesSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Giao diện" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Chế độ hiển thị</label>
            </div>
            <Radio.Group defaultValue="light" onChange={() => setHasChanges(true)}>
              <Radio.Button value="light">Sáng</Radio.Button>
              <Radio.Button value="dark">Tối</Radio.Button>
              <Radio.Button value="auto">Tự động</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Ngôn ngữ</label>
            </div>
            <Select
              defaultValue="vi"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            >
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
              <Option value="ja">日本語</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Múi giờ</label>
            </div>
            <Select
              defaultValue="asia_hanoi"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            >
              <Option value="asia_hanoi">Hà Nội (GMT+7)</Option>
              <Option value="asia_tokyo">Tokyo (GMT+9)</Option>
              <Option value="america_newyork">New York (GMT-5)</Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Card title="Hiển thị danh sách" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Hiển thị avatar trong danh sách</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Hiển thị ảnh đại diện người được giao việc
              </div>
            </div>
            <Switch defaultChecked onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Nhóm công việc theo trạng thái</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Tự động nhóm công việc theo trạng thái
              </div>
            </div>
            <Switch defaultChecked onChange={() => setHasChanges(true)} />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Số công việc hiển thị mỗi trang</label>
            </div>
            <Select
              defaultValue="20"
              style={{ width: '100%' }}
              onChange={() => setHasChanges(true)}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Card title="Tuỳ chọn khác" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Hiển thị gợi ý công việc
          </Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Bật âm thanh thông báo
          </Checkbox>
          <Checkbox onChange={() => setHasChanges(true)}>Tự động lưu bản nháp</Checkbox>
          <Checkbox defaultChecked onChange={() => setHasChanges(true)}>
            Hiển thị phím tắt
          </Checkbox>
        </Space>
      </Card>
    </Space>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'account':
        return <AccountSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar Menu */}
      <div
        style={{
          width: 280,
          background: '#fff',
          padding: '24px 0',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ padding: '0 24px 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Cài đặt</h2>
        </div>
        <div>
          {menuItems.map(item => (
            <div
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: activeSection === item.key ? '#e6f7ff' : 'transparent',
                borderLeft:
                  activeSection === item.key ? '3px solid #1890ff' : '3px solid transparent',
                color: activeSection === item.key ? '#1890ff' : '#262626',
                fontWeight: activeSection === item.key ? 500 : 400,
                transition: 'all 0.3s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: 24, paddingBottom: hasChanges ? 80 : 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>{renderContent()}</div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 280,
            right: 0,
            padding: '16px 24px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            zIndex: 100,
          }}
        >
          <Button icon={<CloseOutlined />} onClick={handleReset}>
            Hủy bỏ
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
