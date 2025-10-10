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
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useCreate, useCustomMutation, useList } from '@refinedev/core';
import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import { Form, Input, List, Modal, Popover, Space } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import ChecklistActivity from './ChecklistActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import InstructorCount from './InstructorCount';
import LocationActivity from './LocationActivity';
import MoreActivity from './MoreActivity';
import PriorityActivity from './PriorityActivity';
import SelectActivityType from './SelectActivityType';
import StageActivity from './StageActivity';
import StudentCount from './StudentCount';
import SubtaskActivity from './SubtaskActivity';
import TimeEstimateActivity from './TimeEstimateActivity';

const { TextArea } = Input;

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface FormAddTaskProps {
  openUploader: boolean;
  onSubmit?: (params: { data: FormAddActivityPayload; callback: () => void }) => void;
}
const FormAddTask = forwardRef(({ openUploader, onSubmit }: FormAddTaskProps, ref) => {
  const [form] = Form.useForm();
  const actionRef = useRef<ModalAction>();
  const { currentWorkspace } = useWorkspaces();
  const [taskOrEvent, setTaskOrEvent] = useState<ActivityType>(ActivityType.TASK);
  const [category, setCategory] = useState<string>();
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customForm] = Form.useForm();
  const { mutate: createCategory } = useCreate<Category>();
  const { mutate: uploadFiles } = useCustomMutation();

  const { data: categoriesData } = useList<Category>({
    resource: 'activities/category',
    pagination: { mode: 'off' },
  });

  const onCreateCategory = (values: { name: string; description: string }) => {
    createCategory(
      {
        resource: 'activities/category',
        values: {
          name: values.name,
          description: values.description,
        },
      },
      {
        onSuccess: result => {
          const newCategory = result.data;
          setCategory(newCategory.id);
          form.setFieldValue('category', newCategory.id);

          setCustomModalOpen(false);
          customForm.resetFields();
        },
      },
    );
  };

  const { user: identity } = useAuth();
  const currentUserRole = identity?.role;

  useImperativeHandle(ref, () => ({
    submitForm: (action: ModalAction) => {
      actionRef.current = action;
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
  const [errors, setErrors] = useState<{ stage: boolean; location: boolean }>({
    stage: false,
    location: false,
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [timeEstimate, setTimeEstimate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [instructorCount, setInstructorCount] = useState<number>(0);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [selectedPriority, setSelectedPriority] = useState<ActivityPriorityLevel | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleToggleSelectUser = (user: IUser) => {
    setSelectedAssignees(prev => {
      const newAssignees = prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user];

      form.setFieldValue('assignees', newAssignees);
      return newAssignees;
    });
  };

  const handleActivityTypeChange = useCallback(
    (value: ActivityType) => {
      setTaskOrEvent(value);
      form.setFieldValue('type', value);
    },
    [form],
  );

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

  const handleInstructorCountChange = useCallback(
    (participant: number) => {
      setInstructorCount(Number(participant));
      form.setFieldValue('instructorCount', participant);
    },
    [form],
  );

  const handleStudentCountChange = useCallback(
    (participant: number) => {
      setStudentCount(Number(participant));
      form.setFieldValue('studentCount', participant);
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
    (nextStage: IStage | null) => {
      setErrors(prev => ({ ...prev, stage: !nextStage }));
      setStage(nextStage);
      form.setFieldValue('stage', nextStage);
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
    setLocation('');
    setInstructorCount(0);
    setStudentCount(0);
    setErrors({ stage: false, location: false });
  };

  const handleSubmit = async (values: any) => {
    try {
      let fileUrls: string[] = [];
      if (attachments.length > 0) {
        try {
          const formData = new FormData();
          attachments.forEach(file => formData.append('files', file));

          const uploadResult = await new Promise<any>((resolve, reject) => {
            uploadFiles(
              {
                url: '/upload/multi',
                method: 'post',
                values: formData,
                config: {
                  headers: { 'Content-Type': 'multipart/form-data' },
                },
              },
              {
                onSuccess: res => resolve(res),
                onError: error => reject(error),
              },
            );
          });

          if (Array.isArray(uploadResult)) {
            if (uploadResult.length > 0 && uploadResult[0].url) {
              fileUrls = uploadResult.map((item: any) => item.url);
            } else {
              fileUrls = uploadResult;
            }
          } else if (uploadResult.data && uploadResult.data.urls) {
            fileUrls = uploadResult.data.urls;
          } else if (Array.isArray(uploadResult.data)) {
            if (uploadResult.data.length > 0 && uploadResult.data[0].url) {
              fileUrls = uploadResult.data.map((item: any) => item.url);
            } else {
              fileUrls = uploadResult.data;
            }
          } else {
            return;
          }
        } catch (uploadError) {
          return;
        }
      }

      const formData: FormAddActivityPayload = {
        name: values.name?.trim(),
        description: values.description?.trim(),
        type: values.type,
        stageId: values.stage.id,
        workspaceId: currentWorkspace?.id || '',
        priority: selectedPriority?.value,
        estimateTime: parseFloat(timeEstimate) || 0,
        startTime: dateRange.start?.toDate(),
        endTime: dateRange.end?.toDate(),
        location: values.location || null,
        instructorCount: values.instructorCount || null,
        studentCount: values.studentCount || null,
        assignees: selectedAssignees.map(user => ({
          userId: user.id,
        })),
        subtask: subtasks.filter(task => task.trim()),
        checklist: checklists,
        attachments: fileUrls,
      };

      onSubmit?.({
        data: formData,
        callback: () => handleReset(),
      });
    } catch (error) {
      console.error('❌ Lỗi khi submit form:', error);
    }
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
        instructorCount: 0,
        studentCount: 0,
        type: taskOrEvent,
      }}
    >
      <Space direction="vertical" size={'middle'} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
            <SelectActivityType value={taskOrEvent} onChange={handleActivityTypeChange} />

            {taskOrEvent === 'event' && (
              <>
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  onOpenChange={setCategoryOpen}
                  styles={{ body: { padding: 0 } }}
                  open={categoryOpen}
                  content={
                    <div style={{ width: 220, padding: 5 }}>
                      <List
                        size="small"
                        dataSource={
                          currentUserRole === 'TM'
                            ? [
                                ...(categoriesData?.data || []),
                                { id: 'custom', name: 'Tùy chỉnh', description: '' },
                              ]
                            : categoriesData?.data || []
                        }
                        renderItem={item => (
                          <List.Item
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              borderRadius: 6,
                              backgroundColor: item.id === category ? '#f0f6ff' : 'transparent',
                            }}
                            onClick={() => {
                              if (item.id === 'custom') {
                                setCustomModalOpen(true);
                              } else {
                                setCategory(item.id);
                                form.setFieldValue('category', item.id);
                              }
                              setCategoryOpen(false);
                            }}
                          >
                            <span style={{ flex: 1 }}>{item.name}</span>
                            {item.id === category && <IconCheck size={14} />}
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
                      justifyContent: 'space-between',
                      gap: 6,
                      cursor: 'pointer',
                      border: '1px solid rgb(240, 240, 240)',
                      borderRadius: 6,
                      padding: '0px 7px',
                      background: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#24292f',
                      minWidth: 160,
                      height: 27,
                      transition: 'all 0.2s ease',
                      boxShadow: categoryOpen
                        ? '0 0 0 2px #1677ff33'
                        : '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => setCategoryOpen(!categoryOpen)}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#646464' }}>
                      {categoriesData?.data.find(opt => opt.id === category)?.name ||
                        'Chọn loại sự kiện'}
                    </span>
                    <IconChevronRight
                      size={14}
                      style={{
                        transform: categoryOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#8c8c8c',
                      }}
                    />
                  </div>
                </Popover>
                <Modal
                  title="Thêm danh mục sự kiện"
                  open={customModalOpen}
                  onCancel={() => setCustomModalOpen(false)}
                  onOk={() => customForm.submit()}
                  okText="Tạo danh mục"
                  cancelText="Hủy"
                  centered={false}
                  width={450}
                  style={{
                    borderRadius: 10,
                    transform: 'translateY(40px)',
                  }}
                >
                  <Form form={customForm} layout="vertical" onFinish={onCreateCategory}>
                    <Form.Item
                      name="name"
                      label="Tên danh mục"
                      style={{ marginBottom: 8 }}
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                      <Input placeholder="Nhập tên loại sự kiện" />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Mô tả chi tiết"
                      style={{ marginBottom: 0 }}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Nhập mô tả chi tiết..."
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
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
            autoSize={{ minRows: 1, maxRows: 2 }}
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
          />
        </Form.Item>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StageActivity value={stage} onChange={handleStateChange} error={errors.stage} />
            <AssigneeActivity
              selectedUser={selectedAssignees}
              onToggleSelectUser={handleToggleSelectUser}
            />
            {taskOrEvent === ActivityType.EVENT && (
              <>
                <InstructorCount value={instructorCount} onChange={handleInstructorCountChange} />
                <StudentCount value={studentCount} onChange={handleStudentCountChange} />
                <LocationActivity
                  value={location}
                  onChange={handleLocationChange}
                  error={errors.location}
                />
              </>
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

      <Form.Item name="category" hidden>
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
      <Form.Item name="instructorCount" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="studentCount" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
});

export default FormAddTask;
