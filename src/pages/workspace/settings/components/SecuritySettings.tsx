import { Card, Typography } from "antd";

const SecuritySettings = () => {
  return (
    <Card title="Security Settings">
      <Typography.Paragraph>
        Đây là trang <strong>bảo mật</strong> cho workspace.
      </Typography.Paragraph>
      <Typography.Text type="secondary">
        Bạn có thể chỉnh sửa các tùy chọn liên quan đến mật khẩu, quyền hạn, xác thực...
      </Typography.Text>
    </Card>
  );
};

export default SecuritySettings;
