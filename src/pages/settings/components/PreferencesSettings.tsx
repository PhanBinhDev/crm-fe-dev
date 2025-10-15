import { Card, Checkbox, Divider, Radio, Select, Space, Switch } from 'antd';

const { Option } = Select;

const PreferencesSettings = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Giao diện" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Chế độ hiển thị</label>
            </div>
            <Radio.Group defaultValue="light">
              <Radio.Button value="light">Sáng</Radio.Button>
              <Radio.Button value="dark">Tối</Radio.Button>
              <Radio.Button value="auto">Tự động</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Ngôn ngữ</label>
            </div>
            <Select defaultValue="vi" style={{ width: '100%' }}>
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
              <Option value="ja">日本語</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Múi giờ</label>
            </div>
            <Select defaultValue="asia_hanoi" style={{ width: '100%' }}>
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
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Nhóm công việc theo trạng thái</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Tự động nhóm công việc theo trạng thái
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Số công việc hiển thị mỗi trang</label>
            </div>
            <Select defaultValue="20" style={{ width: '100%' }}>
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
          <Checkbox defaultChecked>Hiển thị gợi ý công việc</Checkbox>
          <Checkbox defaultChecked>Bật âm thanh thông báo</Checkbox>
          <Checkbox>Tự động lưu bản nháp</Checkbox>
          <Checkbox defaultChecked>Hiển thị phím tắt</Checkbox>
        </Space>
      </Card>
    </Space>
  );
};

export default PreferencesSettings;
