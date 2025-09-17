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
    setAssignees(prev => {
      const exists = prev.some(u => u.id === user.id);
      return exists ? prev.filter(u => u.id !== user.id) : [...prev, user];
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
        size="middle"
        variant="borderless"
        style={{
          fontWeight: 600,
          fontSize: 17,
          border: '1px solid transparent',
          paddingLeft: 4,
        }}
        autoSize={{ minRows: 1, maxRows: 4 }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#f0f0f0';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
        }}
        onFocus={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'transparent';
        }}
        name="reminderContent"
      />

      <Space
        size="middle"
        wrap
        styles={{
          item: {
            width: '100%',
          },
        }}
      >
        {/* Hạn */}
        <Space>
          <DuedateActivity value={{ start: null, end: dayjs() }} onChange={() => {}} />

          {/* Người phụ trách */}
          <AssigneeActivity
            title={'Người nhận'}
            selectedUser={assignees}
            onToggleSelectUser={handleToggleUser}
          />

          {/* Thời gian nhắc nhở */}
          <NotifyActivity value={notifyBefore} onChange={setNotifyBefore} />
        </Space>

        {/* File đính kèm */}
        {openUploader && <FileAttachments value={attachments} onChange={setAttachments} />}
      </Space>
    </div>
  );
};

export default FormAddReminder;
