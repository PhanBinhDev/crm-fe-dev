import { Typography, Upload } from 'antd';
import { useState } from 'react';

const { Dragger } = Upload;

interface FileAttachmentsProps {
  title?: string;
  view: 'list' | 'grid' | 'internal';
}

const FileAttachments = ({ title = 'Tệp đính kèm', view }: FileAttachmentsProps) => {
  const [fileList, setFileList] = useState([]);

  return (
    <div>
      <Typography.Text style={{ color: '#838383' }}>{title}</Typography.Text>
      <Dragger
        multiple
        showUploadList={true}
        customRequest={({ file, onSuccess }) => {
          setTimeout(() => {
            onSuccess && onSuccess('ok');
          }, 800); // giả lập upload
        }}
        fileList={fileList}
        style={{
          marginTop: 8,
          minHeight: 40,
          padding: '0 16px',
          borderStyle: 'solid',
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ textAlign: 'center', color: '#838383' }}>
          Kéo thả tệp vào đây để đính kèm hoặc{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#333' }}>
            duyệt
          </span>
        </div>
      </Dragger>
    </div>
  );
};

export default FileAttachments;
