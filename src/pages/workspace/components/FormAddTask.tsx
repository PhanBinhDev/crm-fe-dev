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
import { useWorkspaces } from '@/hooks/useWorkspaces';
import {
  IconBook,
  IconBrandHipchat,
  IconCheck,
  IconChevronRight,
  IconTable,
} from '@tabler/icons-react';
import { Form, Input, List, Popover, Space } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import ChecklistActivity from './ChecklistActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import LocationActivity from './LocationActivity';
import MoreActivity from './MoreActivity';
import PriorityActivity from './PriorityActivity';
import QuantityParticipants from './QuantityParticipants';
import SelectActivityType from './SelectActivityType';
import StageActivity from './StageActivity';
import SubtaskActivity from './SubtaskActivity';
import TimeEstimateActivity from './TimeEstimateActivity';

const { TextArea } = Input;

const typeCategories = [
  { label: 'Seminar', value: 'seminar', icon: <IconTable size={15} /> },
  { label: 'Workshop', value: 'workshop', icon: <IconBrandHipchat size={15} /> },
  { label: 'Tutor', value: 'tutor', icon: <IconBook size={15} /> },
];

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
  const { currentWorkspace } = useWorkspaces();
  const [taskOrEvent, setTaskOrEvent] = useState<ActivityType>(ActivityType.TASK);
  const [category, setCategory] = useState<string | 'seminar' | 'workshop' | 'tutor'>('tutor');

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
  const [location, setLocation] = useState<string>('');
  const [quantityParticipants, setQuantityParticipants] = useState<number>(0);
  const [selectedPriority, setSelectedPriority] = useState<ActivityPriorityLevel | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
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
  const handleLocationChange = useCallback(
    (loc: string) => {
      setLocation(loc);
      form.setFieldValue('location', loc);
    },
    [form],
  );

  const handleQuantityParticipantsChange = useCallback(
    (participant: number) => {
      setQuantityParticipants(Number(participant));
      form.setFieldValue('participants', participant);
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
    (setLocation(''), setQuantityParticipants(0));
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
        assignees: selectedAssignees.map(user => ({
          userId: user.id,
        })),
        priority: selectedPriority?.value,
        estimateTime: parseFloat(timeEstimate) || 0,
        stageId: values.stage.id,
        type: values.type,
        category: values.category,
        startTime: dateRange.start?.toDate(),
        endTime: dateRange.end?.toDate(),
        files: attachments,
        subtask: subtasks.filter(task => task.trim()),
        checklist: checklists,
        workspaceId: currentWorkspace?.id || '',
        location: values.location || null,
        quantityParticipants: values.quantityParticipants || null,
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
        location: '',
        quantityParticipants: 0,
        type: taskOrEvent,
      }}
    >
      <Space direction="vertical" size={'middle'} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
            <SelectActivityType value={taskOrEvent} onChange={setTaskOrEvent} />
            {taskOrEvent === 'event' && (
              <Form.Item name="category" initialValue="tutor" style={{ marginBottom: 0 }}>
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  onOpenChange={setCategoryOpen}
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                  open={categoryOpen}
                  content={
                    <div style={{ width: 200, padding: 5 }}>
                      <List
                        size="small"
                        dataSource={typeCategories}
                        renderItem={item => (
                          <List.Item
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '5px 7px',
                              cursor: 'pointer',
                              fontWeight: 400,
                              fontSize: 14,
                              color: '#333',
                              backgroundColor: item.value === category ? '#f0f6ff' : 'transparent',
                              borderRadius: 6,
                              margin: '2px 4px',
                              border: 'none',
                              position: 'relative',
                            }}
                            onMouseEnter={e => {
                              if (item.value !== category) {
                                (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                              }
                            }}
                            onMouseLeave={e => {
                              if (item.value !== category) {
                                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                              }
                            }}
                            onClick={() => {
                              setCategory(item.value);
                              form.setFieldValue('category', item.value);
                              setCategoryOpen(false);
                            }}
                          >
                            <span
                              style={{
                                fontSize: 16,
                                color: item.value === category ? '#1677ff' : '#666',
                              }}
                            >
                              {item.icon}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                color: item.value === category ? '#1677ff' : '#333',
                              }}
                            >
                              {item.label}
                            </span>

                            {item.value === category && <IconCheck size={14} />}
                          </List.Item>
                        )}
                      />
                    </div>
                  }
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      border: '1px solid #e4e4e4ff',
                      borderRadius: 6,
                      padding: '4px 8px',
                      background: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#24292f',
                      minWidth: 'auto',
                      height: 27,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => setCategoryOpen(!categoryOpen)}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: '#656d76',
                        display: 'inline-flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      {typeCategories.find(opt => opt.value === category)?.icon}
                    </span>
                    <span
                      style={{
                        color: '#24292f',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      {typeCategories.find(opt => opt.value === category)?.label}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        lineHeight: 1,
                        transform: categoryOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <IconChevronRight size={14} />
                    </span>
                  </div>

                  {/* <Button
                    style={{
                      height: 27,
                    }}
                  >
                    <div></div>
                    <IconChevronRight
                      size={14}
                      style={{
                        transform: categoryOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </Button> */}
                </Popover>
              </Form.Item>
            )}
          </div>

          <MoreActivity
            showActions={showActions}
            onShowAction={action =>
              setShowActions(prev => ({
                ...prev,
                [action]: !prev[action],
              }))
            }
          />
        </div>
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}
          style={{ marginBottom: 0 }}
        >
          <TextArea
            placeholder="Nhập tên nhiệm vụ/hoạt động..."
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

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StageActivity value={stage} onChange={handleStateChange} error={stageError} />
            <AssigneeActivity
              selectedUser={selectedAssignees}
              onToggleSelectUser={handleToggleSelectUser}
            />
            <QuantityParticipants
              value={quantityParticipants}
              onChange={handleQuantityParticipantsChange}
            />
            {taskOrEvent === 'event' && (
              <LocationActivity value={location} onChange={handleLocationChange} />
            )}
            <DuedateActivity value={dateRange} onChange={handleDateRangeChange} />
            <PriorityActivity value={selectedPriority} onChange={handlePrioritySelect} />
            <TimeEstimateActivity value={timeEstimate} onChange={handleTimeEstimateChange} />
          </div>
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

      <Form.Item name="type" hidden>
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

      <Form.Item name="location" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="quantityParticipants" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
});

export default FormAddTask;
