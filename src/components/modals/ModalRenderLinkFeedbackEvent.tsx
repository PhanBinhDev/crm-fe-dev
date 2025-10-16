import { IActivity } from '@/common/types';
import { IconCopy } from '@tabler/icons-react';
import { Button, Input, Modal, Space, message } from 'antd';

interface ModalRenderLinkFeedbackEventProps {
  activity: IActivity;
  setOpenModal: () => void;
}

const ModalRenderLinkFeedbackEvent = ({
  activity,
  setOpenModal,
}: ModalRenderLinkFeedbackEventProps) => {
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const feedbackLink = `${VITE_API_BASE_URL}/feedback-event/${activity.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedbackLink);
      message.success('Đã sao chép liên kết!');
    } catch {
      message.error('Không thể sao chép liên kết!');
    }
  };

  return (
    <Modal
      open
      footer={null}
      onCancel={() => setOpenModal()}
      title="Liên kết phản hồi sự kiện"
      centered
      width={520}
    >
      <Space.Compact
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Input
          value={feedbackLink}
          readOnly
          style={{
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            background: '#f9f9f9',
          }}
        />
        <Button
          type="default"
          icon={<IconCopy size={16} />}
          onClick={handleCopy}
          style={{
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
          }}
          className="hover:text-red-500"
        />
      </Space.Compact>
    </Modal>
  );
};

export default ModalRenderLinkFeedbackEvent;
