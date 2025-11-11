import { Button, DatePicker, message, Modal, Space, Switch, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  link?: string;
  defaultPublic?: boolean;
  defaultExpire?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  link,
  defaultPublic = false,
  defaultExpire = null,
}) => {
  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [expireDate, setExpireDate] = useState<dayjs.Dayjs | null>(
    defaultExpire ? dayjs(defaultExpire) : null,
  );

  const handleSave = () => {
    message.success('Đã lưu cài đặt chia sẻ');
    onClose();
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      message.success('Đã sao chép liên kết chia sẻ!');
    } catch {
      message.error('Không thể sao chép link!');
    }
  };

  return (
    <Modal
      open={open}
      title="Cài đặt chia sẻ"
      onCancel={onClose}
      onOk={handleSave}
      okText="Lưu"
      centered
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Typography.Text strong>Trạng thái chia sẻ:</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Switch
              checked={isPublic}
              onChange={setIsPublic}
              checkedChildren="Công khai"
              unCheckedChildren="Riêng tư"
            />
          </div>
        </div>

        <div>
          <Typography.Text strong>Thời gian hết hạn:</Typography.Text>
          <DatePicker
            showTime
            style={{ width: '100%', marginTop: 8 }}
            value={expireDate}
            onChange={v => setExpireDate(v)}
          />
        </div>

        {isPublic && link && (
          <div>
            <Typography.Text strong>Liên kết chia sẻ:</Typography.Text>
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <input
                readOnly
                value={link}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                }}
              />
              <Button onClick={handleCopy}>Sao chép</Button>
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
};
