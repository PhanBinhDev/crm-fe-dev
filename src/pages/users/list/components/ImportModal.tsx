import { FC, useState } from 'react';
import { Modal, Upload, Input, Button, Progress, message, Divider } from 'antd';
import { UploadOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { UserService } from '@/services/api/user';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: FC<ImportModalProps> = ({ visible, onClose, onSuccess }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [fileProcessed, setFileProcessed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // Không cần các state phức tạp nữa

  const handleFileUpload = async (file: RcFile) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.type === 'application/vnd.ms-excel';
    
    if (!isExcel) {
      message.error('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return false;
    }

    setFileList([file]);
    setUploadMethod('file');
    setUploading(true);
    setUploadProgress(0);
    setFileProcessed(false);
    
    // Simulate progress khi chọn file - chạy mượt và dừng khi xong
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Dừng progress và hiển thị hoàn thành
          setTimeout(() => {
            setFileProcessed(true);
            setUploading(false);
            setUploadProgress(0);
          }, 800); // Đợi 0.8s để user thấy 100% rõ ràng
          return 100;
        }
        return prev + 8; // Tăng chậm hơn để mượt
      });
    }, 80); // Interval nhỏ hơn để mượt hơn
    
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
        console.log('Converted URL:', `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`);
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

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      message.error('Vui lòng nhập URL file');
      return;
    }

    if (!validateUrl(urlInput.trim())) {
      message.error('URL không hợp lệ. Vui lòng nhập URL đúng định dạng (bắt đầu bằng http:// hoặc https://)');
      return;
    }

    // Tự động convert Google Sheet URL
    const convertedUrl = convertGoogleSheetUrl(urlInput.trim());
    if (convertedUrl !== urlInput.trim()) {
      console.log('URL đã được convert:', convertedUrl);
    }

    setUploading(true);
    setUploadMethod('url');
    setUploadProgress(0);

    try {
      // Simulate progress - chạy mượt và dừng khi xong
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 8; // Tăng chậm hơn để mượt
        });
      }, 80); // Interval nhỏ hơn để mượt hơn

      // Call API to import from URL
      const response = await UserService.importUsersFromUrl(convertedUrl);
      console.log('URL Import response:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
                                                       // Kiểm tra response từ backend với cấu trúc mới
        if (response && response.statusCode === 200) {
          console.log('Response data structure (URL):', response.data);
          console.log('Success count (URL):', response.data.successCount);
          console.log('Failure count (URL):', response.data.failureCount);
          console.log('Errors array (URL):', response.data.errors);
          
          const { successCount, failureCount, errors } = response.data;
          
                     if (successCount > 0) {
             // Có user import thành công
             if (failureCount > 0) {
                            // Có cả thành công và thất bại
             message.warning(`Import thành công ${successCount} người dùng từ URL, nhưng có ${failureCount} user thất bại.`);
             
                            // Không cần hiển thị chi tiết lỗi, chỉ cần message tổng quan
             } else {
               // Tất cả đều thành công
               message.success(`Import thành công từ URL! Đã import ${successCount} người dùng.`);
               onSuccess();
               onClose();
             }
                    } else if (failureCount > 0) {
           // Tất cả đều thất bại
           message.error(`Import thất bại! ${failureCount} user không thể import.`);
           
                        // Không cần hiển thị chi tiết lỗi, chỉ cần message tổng quan
         } else {
           // Không có dữ liệu nào được xử lý
           message.warning('File Excel từ URL không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại cấu trúc file.');
         }
       } else {
         message.error('Import từ URL thất bại. Vui lòng kiểm tra file Excel.');
         console.error('URL Import failed - response:', response);
       }
     } catch (error: any) {
       console.error('URL Import error details:', error);
       console.error('Error response:', error?.response);
       console.error('Error data:', error?.response?.data);
       
       const errorResponse = error?.response?.data;
       const statusCode = error?.response?.status;
       console.log('Status Code detected:', statusCode);
       console.log('Error Response:', errorResponse);
       
       let errorMessage = 'Có lỗi xảy ra khi import từ URL';
       
       // Xử lý HTTP status code cụ thể
       if (statusCode === 401) {
         errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
         console.log('401 detected - setting custom message');
       } else if (statusCode === 403) {
         errorMessage = 'Quyền truy cập bị từ chối. Vui lòng kiểm tra quyền chia sẻ của file.';
         console.log('403 detected - setting custom message');
       } else if (statusCode === 404) {
         errorMessage = 'Không tìm thấy file tại URL. Vui lòng kiểm tra đường dẫn và quyền truy cập.';
         console.log('404 detected - setting custom message');
       } else if (statusCode === 500) {
         errorMessage = 'Lỗi server khi xử lý file. Vui lòng thử lại sau.';
         console.log('500 detected - setting custom message');
       }
       
       console.log('Initial errorMessage:', errorMessage);
       
       if (errorResponse) {
         // Xử lý các loại error khác nhau từ backend
         if (errorResponse.message) {
           // Kiểm tra xem message từ backend có chứa status code 401/403 không
           if (errorResponse.message.includes('status code 401') || errorResponse.message.includes('status code 403')) {
             errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
             console.log('Backend message contains 401/403 - setting custom message');
           } else if (statusCode === 401 || statusCode === 403) {
             errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
             console.log('401/403 override - final message:', errorMessage);
           } else {
             errorMessage = errorResponse.message;
             console.log('Using backend message:', errorMessage);
           }
         }
         
         // Xử lý validation errors chi tiết
         if (errorResponse.details && Array.isArray(errorResponse.details)) {
           console.error('Validation errors:', errorResponse.details);
           
           // Tạo message chi tiết từ validation errors
           const validationMessages = errorResponse.details.map((detail: any) => {
             if (detail.message) return detail.message;
             if (detail.constraints) {
               return Object.values(detail.constraints).join(', ');
             }
             return 'Lỗi validation';
           });
           
           // Không cần hiển thị chi tiết lỗi validation
         }
         
         // Xử lý các error message cụ thể
         if (errorResponse.message === 'Please upload an Excel file') {
           errorMessage = 'Vui lòng tải lên file Excel';
         } else if (errorResponse.message.includes('Invalid file format')) {
           errorMessage = 'Định dạng file không hợp lệ';
         } else if (errorResponse.message.includes('Required columns')) {
           errorMessage = 'File thiếu các cột bắt buộc';
         } else if (errorResponse.message.includes('Data validation failed')) {
           errorMessage = 'Dữ liệu trong file không hợp lệ';
         } else if (errorResponse.message.includes('Invalid URL')) {
           errorMessage = 'URL không hợp lệ hoặc không thể truy cập';
         } else if (errorResponse.message.includes('File not found')) {
           errorMessage = 'Không tìm thấy file tại URL. Vui lòng kiểm tra quyền truy cập';
         } else if (errorResponse.message.includes('Access denied')) {
           errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ của Google Sheet/OneDrive';
         } else if (errorResponse.message.includes('Unsupported URL')) {
           errorMessage = 'URL không được hỗ trợ. Vui lòng sử dụng Google Sheet, OneDrive, hoặc link file Excel trực tiếp';
         } else if (errorResponse.message.includes('Google Sheet access denied')) {
           errorMessage = 'Không thể truy cập Google Sheet. Vui lòng kiểm tra quyền chia sẻ và đảm bảo "Anyone with the link can view"';
         } else if (errorResponse.message.includes('Authentication required')) {
           errorMessage = 'Google Sheet yêu cầu xác thực. Vui lòng kiểm tra quyền chia sẻ công khai';
         }
       }
       
       // Hiển thị error message
       console.log('Final errorMessage to display:', errorMessage);
       message.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSubmit = async () => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel');
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      
      const response = await UserService.importUsers(formData);
      console.log('Import response:', response);
      console.log('Response statusCode:', response?.statusCode);
      console.log('Response data:', response?.data);
      console.log('Response message:', response?.message);
      
                                                       // Kiểm tra response từ backend với cấu trúc mới
        if (response && response.statusCode === 200) {
          console.log('Response data structure (File):', response.data);
          console.log('Success count (File):', response.data.successCount);
          console.log('Failure count (File):', response.data.failureCount);
          console.log('Errors array (File):', response.data.errors);
          
          const { successCount, failureCount, errors } = response.data;
          
                     if (successCount > 0) {
             // Có user import thành công
             if (failureCount > 0) {
               // Có cả thành công và thất bại
               message.warning(`Import thành công ${successCount} người dùng, nhưng có ${failureCount} user thất bại.`);
               
               // Không cần hiển thị chi tiết lỗi, chỉ cần message tổng quan
             } else {
               // Tất cả đều thành công
               message.success(`Import thành công! Đã import ${successCount} người dùng.`);
               onSuccess();
               onClose();
             }
           } else if (failureCount > 0) {
             // Tất cả đều thất bại
             message.error(`Import thất bại! ${failureCount} user không thể import.`);
             
             // Không cần hiển thị chi tiết lỗi, chỉ cần message tổng quan
           } else {
             // Không có dữ liệu nào được xử lý
             message.warning('File Excel không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại cấu trúc file.');
           }
        } else {
          // Nếu response không có statusCode 200
          message.error('Import thất bại. Vui lòng kiểm tra file Excel.');
          console.error('Import failed - response:', response);
        }
    } catch (error: any) {
      console.error('Import error details:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      const errorResponse = error?.response?.data;
      const statusCode = error?.response?.status;
      let errorMessage = 'Có lỗi xảy ra khi import file';
      
      // Xử lý HTTP status code cụ thể
      if (statusCode === 401) {
        errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
      } else if (statusCode === 403) {
        errorMessage = 'Quyền truy cập bị từ chối. Vui lòng kiểm tra quyền chia sẻ của file.';
      } else if (statusCode === 404) {
        errorMessage = 'Không tìm thấy file. Vui lòng kiểm tra đường dẫn và quyền truy cập.';
      } else if (statusCode === 500) {
        errorMessage = 'Lỗi server khi xử lý file. Vui lòng thử lại sau.';
      }
      
             if (errorResponse) {
         // Xử lý các loại error khác nhau từ backend
         if (errorResponse.message) {
           // Kiểm tra xem message từ backend có chứa status code 401/403 không
           if (errorResponse.message.includes('status code 401') || errorResponse.message.includes('status code 403')) {
             errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
           } else if (statusCode === 401 || statusCode === 403) {
             errorMessage = 'Không thể truy cập file. Vui lòng kiểm tra quyền chia sẻ và đảm bảo file có thể truy cập công khai.';
           } else {
             errorMessage = errorResponse.message;
           }
         }
        
        // Xử lý validation errors chi tiết
        if (errorResponse.details && Array.isArray(errorResponse.details)) {
          console.error('Validation errors:', errorResponse.details);
          
          // Tạo message chi tiết từ validation errors
          const validationMessages = errorResponse.details.map((detail: any) => {
            if (detail.message) return detail.message;
            if (detail.constraints) {
              return Object.values(detail.constraints).join(', ');
            }
            return 'Lỗi validation';
          });
          
                     // Không cần hiển thị chi tiết lỗi validation
        }
        
        // Xử lý các error message cụ thể
        if (errorResponse.message === 'Please upload an Excel file') {
          errorMessage = 'Vui lòng tải lên file Excel';
        } else if (errorResponse.message.includes('Invalid file format')) {
          errorMessage = 'Định dạng file không hợp lệ';
        } else if (errorResponse.message.includes('Required columns')) {
          errorMessage = 'File thiếu các cột bắt buộc';
        } else if (errorResponse.message.includes('Data validation failed')) {
          errorMessage = 'Dữ liệu trong file không hợp lệ';
        }
      }
      
      // Hiển thị error message
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setUrlInput('');
    setUploading(false);
    setUploadProgress(0);
    setFileProcessed(false);
    setSubmitLoading(false);
         // Không cần reset các state phức tạp
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
      title="Tải lên tệp tin"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      closeIcon={<CloseOutlined />}
    >
      <div style={{ padding: '20px 0' }}>
        {/* File Upload Section */}
        <div style={{ marginBottom: 24 }}>
          <Upload.Dragger {...uploadProps} disabled={uploading}>
            {uploading && uploadMethod === 'file' ? (
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={uploadProgress} 
                  format={(percent) => `${percent}%`}
                  width={80}
                  status={fileProcessed ? "success" : "active"}
                />
                <div style={{ marginTop: 16 }}>
                  <div>{fileProcessed ? 'Đã xử lý xong!' : 'Đang xử lý...'}</div>
                  {!fileProcessed && (
                    <Button 
                      size="small" 
                      onClick={() => {
                        setUploading(false);
                        setUploadProgress(0);
                        setFileList([]);
                        setFileProcessed(false);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc chọn tệp tin để tải lên</p>
                <p className="ant-upload-hint">XLSX hoặc XLS</p>
              </>
            )}
          </Upload.Dragger>
        </div>

        <Divider>HOẶC</Divider>

                 {/* URL Upload Section */}
         <div style={{ marginBottom: 24 }}>
           <div style={{ marginBottom: 8 }}>
             <strong>Tải lên từ URL</strong>
           </div>
           <div style={{ marginBottom: 12 }}>
             <Input
               placeholder="Nhập URL Google Sheet, OneDrive, hoặc link file Excel trực tiếp"
               value={urlInput}
               onChange={(e) => setUrlInput(e.target.value)}
               disabled={uploading}
               size="large"
             />
           </div>
           <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
             <Button
               onClick={handleUrlUpload}
               disabled={uploading || !urlInput.trim()}
               loading={uploading && uploadMethod === 'url'}
               type="primary"
               size="large"
             >
               Tải lên từ URL
             </Button>
           </div>
           
                       
          
          {/* URL Upload Progress */}
          {uploading && uploadMethod === 'url' && (
            <div style={{ marginTop: 8 }}>
              <Progress percent={uploadProgress} size="small" />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Đang tải lên...</span>
                <Button 
                  size="small" 
                  onClick={() => {
                    setUploading(false);
                    setUploadProgress(0);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>



        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
            <QuestionCircleOutlined />
            <span>Hỗ trợ</span>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleCancel} disabled={uploading}>
              Hủy
            </Button>
                         <Button 
               type="primary" 
               onClick={handleFileSubmit}
               disabled={fileList.length === 0 || uploading}
               loading={submitLoading}
             >
               Hoàn thành
             </Button>
          </div>
        </div>
      </div>

                            {/* Không cần modal phức tạp nữa */}
    </Modal>
  );
};
