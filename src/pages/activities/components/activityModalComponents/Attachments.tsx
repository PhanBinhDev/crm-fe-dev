import { formatFileSize, getFileIcon } from '@/utils/activity';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Form, Upload } from 'antd';

const Attachments = () => {
  return (
    <div>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: '14px',
            color: '#202020',
            fontWeight: 500,
            letterSpacing: '0.3px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <PaperClipOutlined style={{ color: '#8c8c8c' }} />
          File tài liệu
        </div>

        <Form.Item
          name="attachments"
          valuePropName="fileList"
          getValueFromEvent={e => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
          style={{ marginBottom: 0, flex: 1, width: '100%' }}
        >
          <Upload
            name="file"
            action={import.meta.env.VITE_API_UPLOAD_URL as string}
            withCredentials
            listType="text"
            multiple
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true,
            }}
            style={{ width: '100%' }}
            itemRender={(originNode, file, fileList, actions) => {
              return (
                <div
                  key={file.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    marginBottom: 4,
                    background: '#fff',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fafafa';
                    e.currentTarget.style.borderColor = '#d9d9d9';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  {/* File Icon */}
                  <div style={{ marginRight: 12, fontSize: 16 }}>{getFileIcon(file.name)}</div>

                  {/* File Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#262626',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 2,
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8c8c8c',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <span>{formatFileSize(file.size)}</span>
                      {file.status === 'done' && (
                        <span style={{ color: '#52c41a' }}>✓ Đã tải lên</span>
                      )}
                      {file.status === 'uploading' && (
                        <span style={{ color: '#1890ff' }}>⏳ Đang tải...</span>
                      )}
                      {file.status === 'error' && <span style={{ color: '#ff4d4f' }}>✗ Lỗi</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {file.status === 'done' && (
                      <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => actions.download()}
                        style={{ minWidth: 24, height: 24, padding: 0 }}
                      />
                    )}
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => actions.preview()}
                      style={{ minWidth: 24, height: 24, padding: 0 }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => actions.remove()}
                      style={{
                        minWidth: 24,
                        height: 24,
                        padding: 0,
                        color: '#ff4d4f',
                      }}
                    />
                  </div>
                </div>
              );
            }}
          >
            <div
              style={{
                border: '1px dashed #d1d5db',
                borderRadius: 6,
                padding: '10px',
                textAlign: 'center',
                background: '#fafbfc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 60,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = '#fafbfc';
              }}
            >
              <UploadOutlined
                style={{
                  fontSize: 20,
                  color: '#202020',
                  marginBottom: 4,
                }}
              />
              <div
                style={{
                  fontSize: '12px',
                  color: '#202020',
                  textAlign: 'center',
                }}
              >
                Kéo thả hoặc <span style={{ color: '#1890ff', fontWeight: 500 }}>tải lên file</span>
                <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
                  Hỗ trợ nhiều file cùng lúc
                </div>
              </div>
            </div>
          </Upload>
        </Form.Item>
      </div>
    </div>
  );
};

export default Attachments;
