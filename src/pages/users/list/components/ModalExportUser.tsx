import { IUser } from '@/common/types';
import { exportUsersToCSV } from '@/services/utils/exportUtils';
import { IconCheck, IconDownload, IconX } from '@tabler/icons-react';
import { Button, Input, Modal, Select } from 'antd';
import { FC, useState } from 'react';

const USER_FIELDS = [
  { label: 'Họ tên', value: 'name' },
  { label: 'Tên đăng nhập', value: 'username' },
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

  // limit (số) và limitInput (chuỗi show trong input)
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [limitInput, setLimitInput] = useState<string>('');

  const handleDownload = async () => {
    setDownloading(true);
    let exportList = users;
    if (typeof limit === 'number' && limit > 0) {
      exportList = users.slice(0, limit);
    }
    await exportUsersToCSV(exportList, selectedFields);
    setDownloading(false);
    onClose();
  };

  // xử lý khi user gõ/đổi input (chỉ giữ chữ số, enforce max)
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || '';
    const digits = raw.replace(/\D/g, ''); // loại bỏ mọi ký tự non-digit
    if (digits === '') {
      setLimitInput('');
      setLimit(undefined);
      return;
    }
    let num = parseInt(digits, 10);
    if (Number.isNaN(num)) {
      setLimitInput('');
      setLimit(undefined);
      return;
    }
    if (num > users.length) {
      num = users.length;
    }
    const s = String(num);
    setLimitInput(s);
    setLimit(num);
  };

  const handleLimitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey) return;
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleLimitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData?.getData('text') || '';
    const digits = paste.replace(/\D/g, '');
    if (digits === '') {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newVal = input.value.slice(0, start) + digits + input.value.slice(end);
    const newDigits = newVal.replace(/\D/g, '');
    let num = newDigits === '' ? undefined : parseInt(newDigits, 10);
    if (typeof num === 'number' && num > users.length) num = users.length;
    const s = num === undefined ? '' : String(num);
    setLimitInput(s);
    setLimit(num === undefined ? undefined : num);
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} destroyOnHidden width={560}>
      {/* Header */}
      <div
        style={{
          paddingBottom: 16,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
            color: '#1a1a1a',
          }}
        >
          Xuất dữ liệu người dùng
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#555',
            margin: '4px 0 0 0',
          }}
        >
          File sẽ được tải xuống dưới dạng Excel (.xlsx)
        </p>
      </div>

      {/* Controls (Limit + Choose Columns) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {/* Limit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333' }}>
            Giới hạn số lượng xuất (tối đa {users.length})
          </span>
          <Input
            value={limitInput}
            onChange={handleLimitChange}
            onKeyDown={handleLimitKeyDown}
            onPaste={handleLimitPaste}
            placeholder="Nhập số"
            style={{ width: 100 }} // bằng Select
            inputMode="numeric"
            pattern="\d*"
          />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: -8 }}>
          Nếu không nhập, hệ thống sẽ xuất toàn bộ dữ liệu
        </p>

        {/* Choose Columns */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333' }}>Chọn cột</span>
          <Select
            mode="multiple"
            value={selectedFields}
            onChange={values => setSelectedFields(values)}
            options={USER_FIELDS}
            style={{ width: 180 }} // bằng Input
            maxTagCount={0}
            dropdownStyle={{ minWidth: 180, padding: 0 }}
            placeholder={`Cột (${selectedFields.length})`}
            maxTagPlaceholder={() => `Cột (${selectedFields.length})`}
            suffixIcon={<span style={{ fontSize: 12 }}>▼</span>}
            showSearch={false}
            filterOption={false}
            dropdownRender={() => (
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {/* Chọn/Bỏ chọn tất cả */}
                <div
                  onClick={() => {
                    if (selectedFields.length === USER_FIELDS.length) {
                      setSelectedFields([]);
                    } else {
                      setSelectedFields(USER_FIELDS.map(f => f.value));
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    {selectedFields.length === USER_FIELDS.length
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </span>
                  {selectedFields.length === USER_FIELDS.length && <IconX size={16} color="red" />}
                </div>

                {/* Các cột */}
                {USER_FIELDS.map(field => {
                  const isSelected = selectedFields.includes(field.value);
                  return (
                    <div
                      key={field.value}
                      onClick={() => {
                        const newSelected = isSelected
                          ? selectedFields.filter(f => f !== field.value)
                          : [...selectedFields, field.value];
                        setSelectedFields(newSelected);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{field.label}</span>
                      {isSelected && <IconCheck size={16} color="#1677ff" />}
                    </div>
                  );
                })}
              </div>
            )}
          />
        </div>
      </div>

      {/* Hiển thị danh sách đã chọn */}
      <div
        style={{
          marginTop: 12,
          fontSize: '0.95rem',
          color: '#333',
          border: '1px solid #e5e5e5',
          borderRadius: 6,
          padding: '8px 12px',
          background: '#fafafa',
          minHeight: 50,
          userSelect: 'none',
          cursor: 'default',
        }}
      >
        {USER_FIELDS.filter(f => selectedFields.includes(f.value))
          .map(f => f.label)
          .join(', ')}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          marginTop: 24,
        }}
      >
        <Button onClick={onClose} disabled={downloading}>
          Hủy
        </Button>
        <Button
          type="primary"
          icon={<IconDownload size={16} />}
          onClick={handleDownload}
          disabled={selectedFields.length === 0 || downloading}
          loading={downloading}
        >
          Xuất file
        </Button>
      </div>
    </Modal>
  );
};
