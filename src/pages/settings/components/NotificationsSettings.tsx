import {
  Card,
  Checkbox,
  Divider,
  Radio,
  Select,
  Space,
  Switch,
  TimePicker,
  Typography,
} from 'antd';

const { Option } = Select;
const { Text } = Typography;

const NotificationsSettings = () => {
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Card
        title={
          <Space>
            <Text style={{ fontSize: 20 }}>Thông báo</Text>
          </Space>
        }
        bordered={false}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox defaultChecked>Khi được giao công việc mới</Checkbox>
          <Checkbox defaultChecked>Khi có bình luận trong công việc của tôi</Checkbox>
          <Checkbox defaultChecked>Khi công việc của tôi đến hạn</Checkbox>
          <Checkbox>Khi có thành viên mới trong workspace</Checkbox>
          <Checkbox>Bản tin hàng tuần</Checkbox>
          <Checkbox defaultChecked>Thông báo bảo mật</Checkbox>
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
            <Switch defaultChecked />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <Checkbox defaultChecked>Công việc mới</Checkbox>
          <Checkbox defaultChecked>Bình luận và đề cập (@)</Checkbox>
          <Checkbox defaultChecked>Nhắc nhở deadline</Checkbox>
          <Checkbox>Cập nhật từ workspace</Checkbox>
        </Space>
      </Card>

      <Card title="Nhắc nhở công việc" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Nhắc nhở trước deadline</label>
            </div>
            <Select defaultValue="1day" style={{ width: '100%' }}>
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
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Không làm phiền</label>
            </div>
            <Space>
              <TimePicker format="HH:mm" placeholder="Từ" />
              <span>đến</span>
              <TimePicker format="HH:mm" placeholder="Đến" />
            </Space>
          </div>
        </Space>
      </Card>

      <Card title="Tần suất thông báo" bordered={false}>
        <Radio.Group defaultValue="realtime" style={{ width: '100%' }}>
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
};

export default NotificationsSettings;
