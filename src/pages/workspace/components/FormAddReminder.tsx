import { IUser } from '@/common/types';
import { Input, Space } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import NotifyActivity from './NotifyActivity';

const { TextArea } = Input;

interface FormAddReminderProps {
  openUploader: boolean;
}

interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}

const FormAddReminder = ({ openUploader }: FormAddReminderProps) => {
  const [assignees, setAssignees] = useState<IUser[]>([]);
  const [notifyBefore, setNotifyBefore] = useState<NotifyOption | null>({
    label: 'Trước 10 phút',
    value: 10,
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleToggleUser = (user: IUser) => {
    setAssignees((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  };

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Nội dung nhắc nhở */}
      <TextArea
        placeholder="Nhập nội dung nhắc nhở..."
        autoSize={{ minRows: 1, maxRows: 3 }}
        style={{
          border: '1px solid transparent',
          fontSize: 16,
          fontWeight: 500,
          paddingLeft: 4,
        }}
      />

      <Space size="middle" wrap>
        {/* Hạn */}
        <DuedateActivity value={{ start: null, end: dayjs() }} onChange={() => {}} />

        {/* Người phụ trách */}
        <AssigneeActivity
          selectedUser={assignees}
          onToggleSelectUser={handleToggleUser}
        />

        {/* Thời gian nhắc nhở */}
        <NotifyActivity value={notifyBefore} onChange={setNotifyBefore} />

        {/* File đính kèm */}
        {openUploader && (
          <FileAttachments value={attachments} onChange={setAttachments} />
        )}
      </Space>
    </div>
  );
};

export default FormAddReminder;
