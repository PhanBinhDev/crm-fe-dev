import { IUser } from '@/common/types';
import { Input, Space } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import NotifyActivity from './NotifyActivity';

const { TextArea } = Input;

interface FormAddReminderProps {
  openUploader: boolean;
  onChange?: (payload: any) => void;
}

interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}

const FormAddReminder = ({ openUploader, onChange }: FormAddReminderProps) => {
  const [assignees, setAssignees] = useState<IUser[]>([]);
  const [notifyBefore, setNotifyBefore] = useState<NotifyOption | null>({
    label: 'Trước 10 phút',
    value: 10,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<{ start: dayjs.Dayjs | null; end: dayjs.Dayjs | null }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    const payload = {
      content: content.trim(),
      dueDate: dueDate?.end ? dueDate.end.toISOString() : null,
      assignees: assignees.map(u => u.id),
      notifyBefore: notifyBefore?.value === 'none' ? null : notifyBefore?.value,
      attachments,
    };
    onChange?.(payload);
  }, [content, dueDate, assignees, notifyBefore, attachments, onChange]);
  const handleToggleUser = (user: IUser) => {
    setAssignees(prev => {
      const exists = prev.some(u => u.id === user.id);
      return exists ? prev.filter(u => u.id !== user.id) : [...prev, user];
    });
  };

  return (
    <div
      style={{
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
        value={content}
        onChange={e => setContent(e.target.value)}
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
          <DuedateActivity value={dueDate} onChange={setDueDate} />

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
