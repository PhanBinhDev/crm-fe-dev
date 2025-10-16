import { ReminderType } from '@/common/enum/notifications';
import { FormAddReminderPayload, IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { IconCalendar } from '@tabler/icons-react';
import { DatePicker, Form, Input, Space } from 'antd';
import dayjs from 'dayjs';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import FileAttachments from './FileAttachments';
import NotifyActivity from './NotifyActivity';

const { TextArea } = Input;

interface FormAddReminderProps {
  openUploader: boolean;
  onSubmit?: (params: { data: FormAddReminderPayload; callback: () => void }) => void;
}

interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}

const FormAddReminder = forwardRef(({ openUploader, onSubmit }: FormAddReminderProps, ref) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormAddReminderPayload>({
    title: '',
    description: '',
    receivers: [],
    notifyBefore: {
      label: 'Đúng giờ',
      value: 0,
    },
    type: ReminderType.EXACT,
    date: new Date(),
    attachments: [],
  });

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.submit();
    },
  }));

  const [assignees, setAssignees] = useState<IUser[]>(() => (user ? [user] : []));
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    form.setFieldsValue({
      receivers: assignees.map(a => a.id) || [],
      attachments: [],
      type: formData.type,
      reminderAt: formData.date,
    });
  }, []);

  const handleToggleUser = useCallback(
    (user: IUser) => {
      const newAssignees = [...assignees];
      const assigneeIndex = newAssignees.findIndex(u => u.id === user.id);

      if (assigneeIndex >= 0) {
        newAssignees.splice(assigneeIndex, 1);
      } else {
        newAssignees.push(user);
      }

      const newReceiverIds = newAssignees.map(u => u.id);

      setAssignees(newAssignees);
      setFormData(prev => ({
        ...prev,
        receivers: newReceiverIds,
      }));

      setTimeout(() => {
        form.setFieldValue('receivers', newReceiverIds);
      }, 0);
    },
    [assignees, form],
  );

  const onNotifyBeforeChange = useCallback((option: NotifyOption) => {
    setFormData(prev => ({
      ...prev,
      notifyBefore: option,
      type: option.value === 0 ? ReminderType.EXACT : ReminderType.BEFORE_TIME,
    }));

    form.setFieldValue('customMinutes', option.value);
    form.setFieldValue('type', option.value === 0 ? ReminderType.EXACT : ReminderType.BEFORE_TIME);
  }, []);

  const handleReset = () => {
    form.resetFields();
    setFormData({
      title: '',
      description: '',
      receivers: [],
      notifyBefore: {
        label: 'Đúng giờ',
        value: 0,
      },
      type: ReminderType.EXACT,
      date: new Date(),
      attachments: [],
    });
  };

  const handleSubmit = useCallback(async (values: FormAddReminderPayload) => {
    onSubmit?.({
      data: values,
      callback: handleReset,
    });
  }, []);

  const onTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
    form.setFieldValue('title', e.target.value);
  }, []);

  const onDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    form.setFieldValue('description', e.target.value);
  }, []);

  const onDateChange = useCallback((date: Date | null) => {
    setFormData(prev => ({ ...prev, date: date || new Date() }));
    form.setFieldValue('reminderAt', date);
  }, []);

  const onAttachmentChange = useCallback((files: File[]) => {
    setAttachments(files);
    form.setFieldValue('attachments', files);
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        title: formData.title,
        description: formData.description,
        receivers: formData.receivers,
        reminderAt: formData.date,
        customMinutes: formData.notifyBefore.value,
        type: formData.type,
        attachments: formData.attachments,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề nhắc nhở' }]}
          style={{ marginBottom: 0 }}
        >
          <TextArea
            placeholder="Nhập tiêu đề nhắc nhở..."
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
            value={formData.title}
            onChange={onTitleChange}
          />
        </Form.Item>

        <Form.Item
          name="description"
          style={{ marginBottom: 0 }}
          rules={[{ required: true, message: 'Vui lòng nhập nội dung nhắc nhở' }]}
        >
          <TextArea
            placeholder="Nhập nội dung nhắc nhở..."
            variant="borderless"
            style={{
              fontSize: 14,
              border: '1px solid transparent',
              paddingLeft: 4,
            }}
            autoSize={{ minRows: 3, maxRows: 5 }}
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
            value={formData.description}
            onChange={onDescriptionChange}
          />
        </Form.Item>

        <Space
          size="middle"
          wrap
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Space
            styles={{
              item: {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          >
            <DatePicker
              style={{
                borderRadius: 7,
                border: `1px solid #d9d9d9`,
              }}
              styles={{
                root: {
                  width: 152,
                },
              }}
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={date => onDateChange(date ? date.toDate() : null)}
              disabledDate={current => {
                return current && current < dayjs().startOf('day');
              }}
              size="small"
              placeholder="Chọn ngày giờ"
              suffixIcon={<IconCalendar size={14} color="#838383" />}
              allowClear={false}
            />

            <AssigneeActivity
              title={'Người nhận'}
              selectedUser={assignees}
              onToggleSelectUser={handleToggleUser}
              tooltipTitle={
                assignees.length > 0 ? undefined : 'Chọn người nhận hoặc để trống để gửi cho tất cả'
              }
            />

            <NotifyActivity value={formData.notifyBefore} onChange={onNotifyBeforeChange} />
          </Space>

          {openUploader && <FileAttachments value={attachments} onChange={onAttachmentChange} />}
        </Space>

        <Form.Item name="receivers" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="reminderAt" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="customMinutes" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="attachments" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="type" hidden>
          <Input />
        </Form.Item>
      </div>
    </Form>
  );
});

export default FormAddReminder;
