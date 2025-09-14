import { ActivityType } from '@/common/enum/activity';
import {
  ActivityPriorityLevel,
  Checklist,
  DateRange,
  FormAddActivityPayload,
  IStage,
  IUser,
  ModalAction,
} from '@/common/types';
import { Form, Input, Space } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import ChecklistActivity from './ChecklistActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import MoreActivity from './MoreActivity';
import PriorityActivity from './PriorityActivity';
import StageActivity from './StageActivity';
import SubtaskActivity from './SubtaskActivity';
import TimeEstimateActivity from './TimeEstimateActivity';

const { TextArea } = Input;

interface FormAddTaskProps {
  openUploader: boolean;
  onSubmit?: (params: {
    data: FormAddActivityPayload;
    action: ModalAction;
    callback: () => void;
  }) => void;
}

const FormAddTask = forwardRef(({ openUploader, onSubmit }: FormAddTaskProps, ref) => {
  const [form] = Form.useForm();
  const actionRef = useRef<ModalAction>();

  useImperativeHandle(ref, () => ({
    submitForm: (action: ModalAction) => {
      actionRef.current = action;

      if (!stage) {
        setStageError(true);
      } else {
        setStageError(false);
      }

      form.submit();
    },
  }));

  const [selectedAssignees, setSelectedAssignees] = useState<IUser[]>([]);
  const [showActions, setShowActions] = useState({
    timeEstimate: false,
    subtasks: false,
    checklist: false,
  });
  const [stage, setStage] = useState<IStage | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [timeEstimate, setTimeEstimate] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<ActivityPriorityLevel | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [stageError, setStageError] = useState(false);

  const handleToggleSelectUser = (user: IUser) => {
    setSelectedAssignees(prev => {
      const newAssignees = prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user];

      form.setFieldValue('assignees', newAssignees);
      return newAssignees;
    });
  };

  const handlePrioritySelect = useCallback(
    (priority: ActivityPriorityLevel | null) => {
      setSelectedPriority(priority);
      form.setFieldValue('priority', priority);
    },
    [form],
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
      form.setFieldValue('dueDate', range);
    },
    [form],
  );

  const handleTimeEstimateChange = useCallback(
    (estimate: string) => {
      setTimeEstimate(estimate);
      form.setFieldValue('timeEstimate', estimate);
    },
    [form],
  );

  const handleSubtasksChange = useCallback(
    (tasks: string[]) => {
      setSubtasks(tasks);
      form.setFieldValue(
        'subtasks',
        tasks.filter(task => task.trim()),
      );
    },
    [form],
  );

  const handleAttachmentsChange = useCallback(
    (files: File[]) => {
      setAttachments(files);

      form.setFieldValue('attachments', files);
    },
    [form],
  );

  const handleChecklistChange = useCallback(
    (checklists: Checklist[]) => {
      setChecklists(checklists);
      form.setFieldValue('checklists', checklists);
    },
    [form],
  );

  const handleStateChange = useCallback(
    (stage: IStage | null) => {
      if (stage) {
        setStageError(false);
      } else {
        setStageError(true);
      }

      setStage(stage);
      form.setFieldValue('stage', stage);
    },
    [form],
  );

  const handleReset = () => {
    form.resetFields();
    setSelectedAssignees([]);
    setSelectedPriority(null);
    setDateRange({ start: null, end: null });
    setTimeEstimate('');
    setSubtasks([]);
    setAttachments([]);
    setChecklists([]);
    setStage(null);
    setShowActions({
      timeEstimate: false,
      subtasks: false,
      checklist: false,
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      setStageError(false);

      if (!values.stage.id) {
        setStageError(true);
        return;
      }

      const formData: FormAddActivityPayload = {
        name: values.name?.trim(),
        description: values.description?.trim(),
        assignees: selectedAssignees.map(user => user.id),
        priority: selectedPriority?.value,
        estimateTime: parseFloat(timeEstimate) || 0,
        stageId: values.stage.id,
        type: ActivityType.TASK,
        startTime: dateRange.start?.toDate(),
        endTime: dateRange.end?.toDate(),
        files: attachments,
        subtask: subtasks.filter(task => task.trim()),
        checklist: checklists,
      };

      onSubmit?.({
        data: formData,
        action: actionRef.current || 'create-action',
        callback: () => handleReset(),
      });
    } catch (error) {}
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        assignees: [],
        priority: null,
        dueDate: { start: null, end: null },
        subtasks: [],
        checklist: [],
        attachments: [],
        timeEstimate: '',
        stage: undefined,
      }}
    >
      <Space direction="vertical" size={'middle'} style={{ width: '100%' }}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}
          style={{ marginBottom: 0 }}
        >
          <TextArea
            placeholder="Task Name"
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
            name="name"
          />
        </Form.Item>

        <Form.Item name="description" style={{ marginBottom: 0 }}>
          <TextArea
            placeholder="Mô tả chi tiết (không bắt buộc)"
            variant="borderless"
            style={{
              fontSize: 14,
              border: '1px solid transparent',
              paddingLeft: 4,
            }}
            autoSize={{ minRows: 1, maxRows: 3 }}
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
          />
        </Form.Item>

        <div
          style={{
            marginTop: 12,
          }}
        >
          <Space wrap>
            <StageActivity value={stage} onChange={handleStateChange} error={stageError} />
            <AssigneeActivity
              selectedUser={selectedAssignees}
              onToggleSelectUser={handleToggleSelectUser}
            />
            <DuedateActivity value={dateRange} onChange={handleDateRangeChange} />
            <PriorityActivity value={selectedPriority} onChange={handlePrioritySelect} />
            {showActions.timeEstimate && (
              <TimeEstimateActivity value={timeEstimate} onChange={handleTimeEstimateChange} />
            )}
            <MoreActivity
              showActions={showActions}
              onShowAction={action =>
                setShowActions(prev => ({
                  ...prev,
                  [action]: !prev[action],
                }))
              }
            />
          </Space>
        </div>

        {showActions.subtasks && (
          <SubtaskActivity value={subtasks} onChange={handleSubtasksChange} />
        )}
        {showActions.checklist && (
          <ChecklistActivity value={checklists} onChange={handleChecklistChange} />
        )}

        {openUploader && <FileAttachments value={attachments} onChange={handleAttachmentsChange} />}
      </Space>

      <Form.Item name="assignees" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="priority" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="dueDate" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="timeEstimate" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="subtasks" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="checklists" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="attachments" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="stage" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
});

export default FormAddTask;
