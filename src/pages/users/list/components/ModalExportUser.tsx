import { FC, useState } from 'react';
import { Modal, Checkbox, Button, Space, InputNumber } from 'antd';
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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Chọn trường để export"
      footer={null}
      destroyOnClose
    >
      <Checkbox.Group
        options={USER_FIELDS}
        value={selectedFields}
        onChange={setSelectedFields as any}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}
      />
      <div style={{ marginBottom: 24 }}>
        <span style={{ marginRight: 8 }}>Giới hạn số lượng export:</span>
        <InputNumber
          min={1}
          value={limit}
          onChange={v => setLimit(v === null ? undefined : v)}
          placeholder="Tất cả"
        />
      </div>
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Huỷ</Button>
        <Button
          type="primary"
          icon={<IconDownload size={16} />}
          onClick={handleDownload}
          disabled={selectedFields.length === 0}
          loading={downloading}
        >
          Download
        </Button>
      </Space>
    </Modal>
  );
};