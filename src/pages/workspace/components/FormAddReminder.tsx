import { FormAddReminderPayload, IUser } from '@/common/types';
import { Form, Input, Space } from 'antd';
import dayjs from 'dayjs';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import NotifyActivity from './NotifyActivity';

const { TextArea } = Input;

interface FormAddReminderProps {
  openUploader: boolean;
  onSubmit?: (params: { data: any; callback: () => void }) => void;
}

interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}

const FormAddReminder = forwardRef(({ openUploader, onSubmit }: FormAddReminderProps, ref) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormAddReminderPayload>({
    content: '',
    assignees: [],
    notifyBefore: {
      label: 'Đúng giờ',
      value: 0,
    },
    date: new Date(),
  });

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.submit();
    },
  }));

  const [assignees, setAssignees] = useState<IUser[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<{ start: dayjs.Dayjs | null; end: dayjs.Dayjs | null }>({
    start: null,
    end: null,
  });

  const handleToggleUser = (user: IUser) => {
    setAssignees(prev => {
      const exists = prev.some(u => u.id === user.id);
      return exists ? prev.filter(u => u.id !== user.id) : [...prev, user];
    });
  };

  const onNotifyBeforeChange = useCallback((option: NotifyOption) => {
    setFormData(prev => ({ ...prev, notifyBefore: option }));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
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

          <AssigneeActivity
            title={'Người nhận'}
            selectedUser={assignees}
            onToggleSelectUser={handleToggleUser}
          />

          <NotifyActivity value={formData.notifyBefore} onChange={onNotifyBeforeChange} />
        </Space>

        {openUploader && <FileAttachments value={attachments} onChange={setAttachments} />}
      </Space>
    </div>
  );
});

export default FormAddReminder;
