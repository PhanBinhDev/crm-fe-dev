import { IconShare } from '@tabler/icons-react';
import { Button, Modal, Space, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import { ShareModal } from './ShareModal';

interface ExamViewerProps {
  open: boolean;
  onClose: () => void;
  fileUrl?: string;
  fileName?: string;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ open, onClose, fileUrl, fileName }) => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={900}
        bodyStyle={{ padding: 0, height: '80vh' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            borderBottom: '1px solid #ddd',
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {fileName || 'Xem đề thi'}
          </Typography.Title>
          <Space>
            <Tooltip title="Chia sẻ">
              <Button
                type="text"
                icon={<IconShare size={18} />}
                onClick={() => setShareOpen(true)}
              />
            </Tooltip>
          </Space>
        </div>

        {fileUrl ? (
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        ) : (
          <div style={{ padding: 20, textAlign: 'center' }}>Không tìm thấy file PDF</div>
        )}
      </Modal>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        link={fileUrl}
        defaultPublic={false}
      />
    </>
  );
};
