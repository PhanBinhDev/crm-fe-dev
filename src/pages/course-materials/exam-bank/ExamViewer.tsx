import { ShareModal } from '@/pages/course-materials/exam-bank/ShareModal';
import { IconShare, IconX } from '@tabler/icons-react';
import { Button, Modal, Space, Typography } from 'antd';
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
        width={1200}
        height="fit-content"
        bodyStyle={{ padding: 0, height: '90vh' }}
        closeIcon={null}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {fileName || 'Xem đề thi'}
          </Typography.Title>
          <Space>
            <Button
              type="primary"
              icon={<IconShare size={18} />}
              onClick={() => setShareOpen(true)}
              style={{ border: '1px solid #d9d9d9' }}
            >
              Chia sẻ
            </Button>
            <Button
              type="text"
              style={{
                borderRadius: '100%',
                marginBottom: 2,
                background: '#0000000a',
              }}
              onClick={onClose}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              icon={
                <IconX
                  size={15}
                  style={{
                    color: '#888',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                />
              }
              onMouseEnter={e => {
                e.currentTarget.style.background = '#bfbfbfff';
                e.currentTarget.style.color = '#222';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000000a';
                e.currentTarget.style.color = '#707070ff';
              }}
            />
          </Space>
        </div>

        {fileType === 'pdf' ? (
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="93%"
            style={{ border: 'none' }}
          />
        ) : (
          <iframe src={officeUrl} width="100%" height="93%" style={{ border: 'none' }} />
        )}
      </Modal>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} link={fileUrl} />
    </>
  );
};
