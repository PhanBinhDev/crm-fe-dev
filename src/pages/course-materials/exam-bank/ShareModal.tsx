import { Button, message, Modal, Space, Typography } from 'antd';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  link?: string;
  defaultExpire?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, link }) => {
  const fileName = link ? link.split('/').pop() : 'Liên kết chia sẻ';

  const expires = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  expires.setHours(expires.getHours() + 1);

  const publicLink =
    import.meta.env.VITE_API_BASE_URL +
    '/exam-public?examName=' +
    fileName +
    '&expires=' +
    expires.toISOString();

  const handleCopy = async () => {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      message.success('Đã sao chép liên kết chia sẻ!');
    } catch {
      message.error('Không thể sao chép link!');
    }
  };

  return (
    <Modal open={open} onCancel={onClose} centered footer={null}>
      <Space direction="vertical" style={{ width: '100%' }}>
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
              value={publicLink}
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
      </Space>
    </Modal>
  );
};
