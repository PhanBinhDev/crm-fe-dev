import { createUserImportTemplate } from '@/services/utils/exportUtils';
import { useCustomMutation } from '@refinedev/core';
import {
  IconDownload,
  IconFileSpreadsheet,
  IconLink,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { Button, Input, Modal, Upload, message } from 'antd';
import { RcFile } from 'antd/es/upload';
import { FC, useState } from 'react';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: FC<ImportModalProps> = ({ visible, onClose, onSuccess }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const { mutate: importUsers } = useCustomMutation();

  const handleDownloadTemplate = () => {
    try {
      createUserImportTemplate();
      message.success('Đã tải file mẫu thành công!');
    } catch (error) {
      message.error('Có lỗi khi tải file mẫu');
    }
  };

  const handleFileUpload = async (file: RcFile) => {
    if (urlInput.trim()) {
      message.error('Chỉ chọn 1 trong 2: tải file hoặc nhập link.');
      return false;
    }
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      message.error('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return false;
    }

    setFileList([file]);

    return false; // Prevent default upload behavior
  };

  const convertGoogleSheetUrl = (url: string): string => {
    // Convert Google Sheet URL từ /edit thành /export
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      // Lấy ID của sheet - cải thiện regex để bắt chính xác hơn
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const sheetId = match[1];
        console.log('Sheet ID extracted:', sheetId);
        console.log('Original URL:', url);
        console.log(
          'Converted URL:',
          `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`,
        );
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
      }
    }
    return url;
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Không cần function xử lý lỗi phức tạp nữa

  // Validate chỉ cho phép 1 trong 2: file hoặc url
  const validateInput = () => {
    if (fileList.length > 0 && urlInput.trim()) {
      // setInputError('Chỉ chọn 1 trong 2: tải file hoặc nhập link.');
      message.error('Chỉ chọn 1 trong 2: tải file hoặc nhập link.');
      return false;
    }
    // setInputError(null);
    return true;
  };

  const handleFileSubmit = async () => {
    if (!validateInput()) return;
    if (fileList.length === 0 && !urlInput.trim()) {
      // setInputError('Vui lòng chọn file hoặc nhập link Google Sheet/Excel.');
      message.error('Vui lòng chọn file hoặc nhập link Google Sheet/Excel.');
      return;
    }
    setSubmitLoading(true);
    try {
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0]);
        importUsers(
          {
            url: '/users/import',
            method: 'post',
            values: formData,
            config: {
              headers: { 'Content-Type': 'multipart/form-data' },
            },
          },
          {
            onSuccess: (res: any) => {
              console.log('Import response:', res);
              console.log('Response keys:', Object.keys(res || {}));
              console.log('Response.data:', res?.data);
              // Response không có statusCode ở top level, chỉ cần check có data là thành công
              if (res?.data) {
                const { successCount, failureCount } = res?.data;
                if (successCount > 0) {
                  if (failureCount > 0) {
                    message.warning(
                      `Import thành công ${successCount} người dùng, nhưng có ${failureCount} user thất bại.`,
                    );
                  } else {
                    message.success(`Import thành công! Đã import ${successCount} người dùng.`);
                    onSuccess();
                    onClose();
                  }
                } else if (failureCount > 0) {
                  message.error(`Import thất bại! ${failureCount} user không thể import.`);
                } else {
                  message.warning(
                    'File không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại cấu trúc file.',
                  );
                }
              } else {
                message.error('Import thất bại. Vui lòng kiểm tra file hoặc link.');
              }
              setSubmitLoading(false);
            },
            onError: (error: any) => {
              console.error('Import error:', error);
              message.error('Có lỗi xảy ra khi import.');
              setSubmitLoading(false);
            },
          },
        );
      } else if (urlInput.trim()) {
        if (!validateUrl(urlInput.trim())) {
          // setInputError('URL không hợp lệ. Vui lòng nhập đúng định dạng.');
          message.error('URL không hợp lệ. Vui lòng nhập đúng định dạng.');
          setSubmitLoading(false);
          return;
        }
        const convertedUrl = convertGoogleSheetUrl(urlInput.trim());
        importUsers(
          {
            url: '/users/import-url',
            method: 'post',
            values: { url: convertedUrl },
          },
          {
            onSuccess: (res: any) => {
              console.log('Import from URL response:', res);
              console.log('Response keys:', Object.keys(res || {}));
              console.log('Response.data:', res?.data);
              // Response không có statusCode ở top level, chỉ cần check có data là thành công
              if (res?.data) {
                const { successCount, failureCount } = res?.data;
                if (successCount > 0) {
                  if (failureCount > 0) {
                    message.warning(
                      `Import thành công ${successCount} người dùng, nhưng có ${failureCount} user thất bại.`,
                    );
                  } else {
                    message.success(`Import thành công! Đã import ${successCount} người dùng.`);
                    onSuccess();
                    onClose();
                  }
                } else if (failureCount > 0) {
                  message.error(`Import thất bại! ${failureCount} user không thể import.`);
                } else {
                  message.warning(
                    'File không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại cấu trúc file.',
                  );
                }
              } else {
                message.error('Import thất bại. Vui lòng kiểm tra file hoặc link.');
              }
              setSubmitLoading(false);
            },
            onError: (error: any) => {
              console.error('Import error:', error);
              message.error('Có lỗi xảy ra khi import.');
              setSubmitLoading(false);
            },
          },
        );
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      message.error('Có lỗi xảy ra khi import.');
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setUrlInput('');
    setSubmitLoading(false);
    onClose();
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    fileList,
    onRemove: () => setFileList([]),
    accept: '.xlsx,.xls',
    multiple: false,
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Tải lên tệp tin</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      closeIcon={<IconX size={20} />}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Upload.Dragger {...uploadProps} style={{ minHeight: 120, borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <IconFileSpreadsheet size={36} color="#228be6" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Kéo thả hoặc chọn tệp tin Excel</div>
              <div style={{ fontSize: 12, color: '#888' }}>Chỉ hỗ trợ .xlsx, .xls</div>
            </div>
          </Upload.Dragger>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Input
            prefix={<IconLink size={16} color="#888" />}
            placeholder="Dán link Google Sheet hoặc Excel (.xlsx)"
            value={urlInput}
            onChange={e => {
              setUrlInput(e.target.value);
            }}
            size="small"
            style={{ fontSize: 13, borderRadius: 6, padding: 4 }}
            allowClear
          />
        </div>
        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #f0f0f0',
            paddingTop: 14,
          }}
        >
          <div
            onClick={handleDownloadTemplate}
            style={{
              color: '#228be6',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: 15,
              userSelect: 'none',
              gap: 4,
            }}
            tabIndex={0}
            onKeyPress={e => {
              if (e.key === 'Enter') handleDownloadTemplate();
            }}
            title="Tải file mẫu import"
          >
            <IconDownload size={18} style={{ marginRight: 2 }} />
            <span>Tải file mẫu</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              onClick={handleCancel}
              style={{
                borderRadius: 6,
                height: 32,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconX size={16} style={{ display: 'flex', alignItems: 'center' }} />
              <span style={{ display: 'flex', alignItems: 'center' }}>Hủy</span>
            </Button>
            <Button
              type="primary"
              onClick={handleFileSubmit}
              loading={submitLoading}
              style={{
                borderRadius: 6,
                height: 32,
                fontSize: 14,
                background: '#228be6',
                borderColor: '#228be6',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconUpload size={16} style={{ display: 'flex', alignItems: 'center' }} />
              <span style={{ display: 'flex', alignItems: 'center' }}>Hoàn tất</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
