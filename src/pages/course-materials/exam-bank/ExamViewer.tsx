import { ShareModal } from '@/pages/course-materials/exam-bank/ShareModal';
import { IconShare } from '@tabler/icons-react';
import { Button, Modal, Space, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';

interface ExamViewerProps {
  open: boolean;
  onClose: () => void;
  fileUrl?: string;
  fileName?: string;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ open, onClose, fileUrl, fileName }) => {
  const fileType = fileUrl?.split('.').pop()?.toLowerCase();
  const [shareOpen, setShareOpen] = useState(false);

  let officeUrl = '';
  if (fileUrl && fileType !== 'pdf') {
    officeUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(fileUrl);
  }

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={900}
        height="fit-content"
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

        {fileType === 'pdf' ? (
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="90%"
            style={{ border: 'none' }}
          />
        ) : (
          <iframe src={officeUrl} width="100%" height="90%" style={{ border: 'none' }} />
        )}
      </Modal>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} link={fileUrl} />
    </>
  );
};
