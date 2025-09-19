import { Card, Typography } from "antd";

const GeneralSettings = () => {
  return (
    <Card title="General Settings">
      <Typography.Paragraph>
        Đây là trang <strong>cài đặt chung</strong> cho workspace.
      </Typography.Paragraph>
      <Typography.Text type="secondary">
        Bạn có thể chỉnh sửa thông tin cơ bản của workspace ở đây.
      </Typography.Text>
    </Card>
  );
};

export default GeneralSettings;
