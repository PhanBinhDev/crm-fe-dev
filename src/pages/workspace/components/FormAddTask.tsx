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
import { DownOutlined } from '@ant-design/icons';
import { IconCalendarEvent, IconCircles } from '@tabler/icons-react';
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
  onChangeType: (param: string) => void;
}

const FormAddTask = forwardRef(
  ({ openUploader, onSubmit, onChangeType }: FormAddTaskProps, ref) => {
    const [form] = Form.useForm();
    const actionRef = useRef<ModalAction>();
    const { currentWorkspace } = useWorkspaces();
    const [taskOrEvent, setTaskOrEvent] = useState<string | 'task' | 'event'>('task');
    const [openParticipant, setOpenParticipant] = useState(false);
    const [openLocation, setOpenLocation] = useState(false);

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
      (participant: string) => {
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
        const attachmentsWithMeta = attachments.map(file => {
          if ('originFileObj' in file && file.originFileObj) {
            const origin = (file as any).originFileObj || file;
            return {
              uid: 'uid' in file ? (file as any).uid : undefined,
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified:
                file.originFileObj &&
                typeof file.originFileObj === 'object' &&
                'lastModified' in file.originFileObj
                  ? file.originFileObj.lastModified
                  : undefined,
              url: (file as any).url || URL.createObjectURL(origin),
            };
          }
          return {
            uid: (file as any).uid || undefined,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          };
        });
        const formData: FormAddActivityPayload = {
          name: values.name?.trim(),
          description: values.description?.trim(),
          assignees: selectedAssignees.map(user => user.id),
          priority: selectedPriority?.value,
          estimateTime: parseFloat(timeEstimate) || 0,
          stageId: values.stage.id,
          type: values.type,
          startTime: dateRange.start?.toDate(),
          endTime: dateRange.end?.toDate(),
          files: attachmentsWithMeta,
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

    const typeOptions = [
      { label: 'Nhiệm vụ', value: 'task', icon: <IconCircles size={15} /> },
      { label: 'Sự kiện', value: 'event', icon: <IconCalendarEvent size={15} /> },
    ];
    const [popoverOpen, setPopoverOpen] = useState(false);

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
        }}
      >
        <Space direction="vertical" size={'middle'} style={{ width: '100%' }}>
          <Form.Item name="type" initialValue="task" style={{ marginBottom: 0 }}>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              styles={{
                body: {
                  padding: '10px 0',
                },
              }}
              content={
                <List
                  size="small"
                  dataSource={typeOptions}
                  renderItem={item => (
                    <List.Item
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '2px 15px',
                        cursor: 'pointer',
                        fontWeight: item.value === taskOrEvent ? 600 : 400,
                        color: item.value === taskOrEvent ? '#1677ff' : undefined,
                      }}
                      onClick={() => {
                        onChangeType(item.value);
                        setTaskOrEvent(item.value);
                        form.setFieldValue('type', item.value);
                        setPopoverOpen(false);
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </List.Item>
                  )}
                />
              }
            >
              <Space
                align="center"
                style={{
                  width: 120,
                  cursor: 'pointer',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  padding: '0 8px',
                  background: '#fff',
                  height: 32,
                }}
                onClick={() => setPopoverOpen(true)}
              >
                <span style={{ flex: 1 }}>
                  {typeOptions.find(opt => opt.value === taskOrEvent)?.label}
                </span>
                <DownOutlined style={{ fontSize: 12, marginLeft: '10px', color: '#888' }} />
              </Space>
            </Popover>
          </Form.Item>
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
              <div>
                <StageActivity value={stage} onChange={handleStateChange} error={stageError} />
              </div>
              <div>
                <AssigneeActivity
                  selectedUser={selectedAssignees}
                  onToggleSelectUser={handleToggleSelectUser}
                />
              </div>
              <div>
                <QuantityParticipants
                  value={quantityParticipants}
                  onChange={handleQuantityParticipantsChange}
                />
              </div>
              <div>
                {taskOrEvent === 'event' && (
                  <LocationActivity value={location} onChange={handleLocationChange} />
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: 5,
              }}
            >
              <div>
                <DuedateActivity value={dateRange} onChange={handleDateRangeChange} />
              </div>
              <div>
                <PriorityActivity value={selectedPriority} onChange={handlePrioritySelect} />
              </div>
              <div>
                {showActions.timeEstimate && (
                  <TimeEstimateActivity value={timeEstimate} onChange={handleTimeEstimateChange} />
                )}
              </div>
              <div>
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
            </div>
          </div>

          {showActions.subtasks && (
            <SubtaskActivity value={subtasks} onChange={handleSubtasksChange} />
          )}
          {showActions.checklist && (
            <ChecklistActivity value={checklists} onChange={handleChecklistChange} />
          )}

          {openUploader && (
            <FileAttachments value={attachments} onChange={handleAttachmentsChange} />
          )}
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

        <Form.Item name="location" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="quantityParticipants" hidden>
          <Input />
        </Form.Item>
      </Form>
    );
  },
);

export default FormAddTask;
