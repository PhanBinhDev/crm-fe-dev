import { Card, Typography } from "antd";

const AppearanceSettings = () => {
  return (
    <Card title="Appearance Settings">
      <Typography.Paragraph>
        Đây là trang <strong>giao diện</strong> cho workspace.
      </Typography.Paragraph>
      <Typography.Text type="secondary">
        Bạn có thể chỉnh sửa theme, màu sắc, logo hiển thị...
      </Typography.Text>
    </Card>
  );
};

export default AppearanceSettings;
