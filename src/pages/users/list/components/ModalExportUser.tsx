import { FC, useState } from 'react';
import { Modal, Checkbox, Button, InputNumber } from 'antd';
import { IconDownload } from '@tabler/icons-react';
import { exportUsersToCSV } from '@/services/utils/exportUtils';
import { IUser } from '@/common/types';

const USER_FIELDS = [
  { label: 'Họ tên', value: 'name' },
  { label: 'Username', value: 'username' },
  { label: 'Email', value: 'email' },
  { label: 'Số điện thoại', value: 'phone' },
  { label: 'Vai trò', value: 'role' },
  { label: 'Ngày sinh', value: 'dateOfBirth' },
  { label: 'Chuyên ngành', value: 'major' },
  { label: 'Trạng thái', value: 'isActive' },
  { label: 'Ngày tạo', value: 'createdAt' },
];

interface ModalExportUserProps {
  open: boolean;
  onClose: () => void;
  users: IUser[];
}

export const ModalExportUser: FC<ModalExportUserProps> = ({ open, onClose, users }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(USER_FIELDS.map(f => f.value));
  const [downloading, setDownloading] = useState(false);
  const [limit, setLimit] = useState<number | undefined>(undefined);

  const handleDownload = async () => {
    setDownloading(true);
    const exportData = limit ? users.slice(0, limit) : users;
    await exportUsersToCSV(exportData, selectedFields);
    setDownloading(false);
    onClose();
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedFields(checked ? USER_FIELDS.map(f => f.value) : []);
  };

  return (
    <>
      <style>{`
        .modern-export-modal .ant-modal-content {
          background: #f8fafc;
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          animation: modalFadeIn 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modern-export-header {
          background: #e0f7fa;
          border-radius: 14px 14px 0 0;
          padding: 28px 0 18px 0;
          text-align: center;
          animation: headerSlideDown 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes headerSlideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modern-export-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a3a;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .modern-export-desc {
          font-size: 1rem;
          color: #3b4a54;
          opacity: 0.85;
        }
        .modern-export-body {
          padding: 28px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .modern-export-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
          padding: 0 32px;
        }
        .modern-export-label {
          font-size: 1rem;
          font-weight: 500;
          color: #1a3a3a;
        }
        .modern-export-input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #b2dfdb;
          background: #f8fafc;
          transition: border 0.2s;
        }
        .modern-export-input:focus {
          border: 1.5px solid #43e97b;
          box-shadow: 0 0 0 2px #43e97b33;
        }
        .modern-export-hint {
          font-size: 0.85rem;
          color: #5e6e7e;
          opacity: 0.7;
        }
        .modern-export-selectall {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #b2dfdb;
          padding: 10px 32px;
          margin: 0 0 0 0;
        }
        .modern-export-fields {
          max-height: 220px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 32px;
          animation: fieldsFadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fieldsFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modern-export-field {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e0f2f1;
          background: #fff;
          transition: background 0.3s, border 0.3s, box-shadow 0.3s;
          cursor: pointer;
          box-shadow: 0 1px 4px 0 rgba(67,233,123,0.04);
          will-change: background, border, box-shadow;
        }
        .modern-export-field.checked {
          background: #e0f7fa;
          border: 1.5px solid #43e97b;
          box-shadow: 0 2px 8px 0 rgba(67,233,123,0.08);
        }
        .modern-export-field:hover {
          border: 1.5px solid #38f9d7;
          background: #e0f7fa;
        }
        .modern-export-count {
          text-align: center;
          font-size: 1rem;
          color: #1a3a3a;
          background: #e0f7fa;
          border-radius: 8px;
          padding: 8px 0;
          margin: 0 32px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }
        .modern-export-count-num {
          color: #43e97b;
          font-weight: 700;
        }
        .modern-export-actions {
          display: flex;
          gap: 16px;
          padding: 18px 32px 32px 32px;
          border-top: 1px solid #b2dfdb;
          margin-top: 10px;
        }
        .modern-export-btn-cancel {
          flex: 1;
          border-radius: 8px !important;
          background: #fff !important;
          color: #1a3a3a !important;
          border: 1.5px solid #b2dfdb !important;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }
        .modern-export-btn-cancel:hover {
          background: #e0f7fa !important;
          color: #43e97b !important;
        }
        .modern-export-btn-download {
          flex: 1;
          border-radius: 8px !important;
          background: #43e97b !important;
          color: #fff !important;
          font-weight: 600;
          border: none !important;
          box-shadow: 0 2px 8px 0 rgba(67,233,123,0.10);
          transition: background 0.2s;
        }
        .modern-export-btn-download:hover {
          // background: #38f9d7 !important;
          background: #2e8c5a !important;
          color: #fff !important;
        }
      `}</style>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        width={480}
        className="modern-export-modal"
      >
        {/* Gradient Header with animation */}
        <div className="modern-export-header">
          <h2 className="modern-export-title">Export Data</h2>
          <p className="modern-export-desc">Chọn các field bạn muốn export vào file</p>
        </div>

        <div className="modern-export-body">
          {/* Record Limit Input */}
          <div className="modern-export-section">
            <label className="modern-export-label">Số lượng records:</label>
            <InputNumber
              min={1}
              value={limit}
              onChange={v => setLimit(v === null ? undefined : v)}
              placeholder="Tất cả"
              className="modern-export-input"
            />
            <p className="modern-export-hint">Để trống để export tất cả ({users.length} records)</p>
          </div>

          {/* Select All */}
          <div className="modern-export-selectall">
            <Checkbox
              checked={selectedFields.length === USER_FIELDS.length}
              onChange={e => toggleSelectAll(e.target.checked)}
            />
            <span className="modern-export-label">
              Chọn tất cả ({USER_FIELDS.length} fields)
            </span>
          </div>

          {/* Field Selection with animation */}
          <div className="modern-export-fields">
            {USER_FIELDS.map(field => {
              const checked = selectedFields.includes(field.value);
              return (
                <div
                  key={field.value}
                  className={`modern-export-field${checked ? ' checked' : ''}`}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() =>
                      setSelectedFields(
                        checked
                          ? selectedFields.filter(f => f !== field.value)
                          : [...selectedFields, field.value]
                      )
                    }
                  />
                  <span className="modern-export-label">{field.label}</span>
                </div>
              );
            })}
          </div>

          {/* Selected Count */}
          <div className="modern-export-count">
            Đã chọn <span className="modern-export-count-num">{selectedFields.length}</span> / {USER_FIELDS.length} fields
          </div>

          {/* Buttons */}
          <div className="modern-export-actions">
            <Button
              onClick={onClose}
              className="modern-export-btn-cancel"
              disabled={downloading}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              icon={<IconDownload size={16} />}
              onClick={handleDownload}
              disabled={selectedFields.length === 0 || downloading}
              loading={downloading}
              className="modern-export-btn-download"
            >
              Download
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
