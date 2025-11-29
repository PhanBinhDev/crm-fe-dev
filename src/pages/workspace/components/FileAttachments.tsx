import { Typography, Upload, UploadFile } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { useMemo } from 'react';

const { Dragger } = Upload;

interface FileAttachmentsProps {
  title?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
}

const FileAttachments = ({ title = 'Tệp đính kèm', value, onChange }: FileAttachmentsProps) => {
  const fileLists = useMemo(() => {
    return (value || []).map((file: File, idx) => ({
      uid: file.name || `${idx}`,
      originFileObj: file,
      name: file.name,
      status: 'done',
      fileName: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    })) as UploadFile[];
  }, [value, onChange]);

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    const newFileList = info.fileList;
    const files: File[] = newFileList.map(f => f.originFileObj).filter(Boolean) as File[];


    if (onChange) {
      onChange(files);
    }
  };

  return (
    <div>
      <Typography.Text style={{ color: '#838383' }}>{title}</Typography.Text>
      <Dragger
        multiple
        showUploadList={true}
        progress={{ strokeColor: { '0%': '#108ee9', '100%': '#87d068' }, strokeWidth: 3 }}
        beforeUpload={() => false}
        onChange={handleChange}
        fileList={fileLists}
        style={{
          marginTop: 8,
          maxHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderStyle: 'solid',
          backgroundColor: 'transparent',
        }}
        pastable
        listType="picture"
        capture="user"
      >
        <div style={{ textAlign: 'center', color: '#838383', fontSize: 13 }}>
          Kéo thả tệp vào đây để đính kèm hoặc
          <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#333' }}>
            duyệt
          </span>
        </div>
      </Dragger>
    </div>
  );
};

export default FileAttachments;
