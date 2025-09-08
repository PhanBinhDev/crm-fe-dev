import { IUser } from '@/common/types';
import { Input, Space } from 'antd';
import { useState } from 'react';
import AssigneeActivity from './AssigneeActivity';
import ChecklistActivity from './ChecklistActivity';
import DuedateActivity from './DuedateActivity';
import FileAttachments from './FileAttachments';
import MoreActivity from './MoreActivity';
import PriorityActivity from './PriorityActivity';
import SubtaskActivity from './SubtaskActivity';
import TimeEstimateActivity from './TimeEstimateActivity';

const { TextArea } = Input;

interface FormAddTaskProps {
  openUploader: boolean;
  btnStage: React.ReactNode;
}

const FormAddTask = ({ openUploader, btnStage }: FormAddTaskProps) => {
  const [selectedAssignee, setSelectedAssignee] = useState<IUser[]>([]);
  const [showActions, setShowActions] = useState({
    timeEstimate: false,
    subtasks: false,
    checklist: false,
  });

  const handleToggleSelectUser = (user: IUser) => {
    setSelectedAssignee(prev => {
      if (prev.includes(user)) {
        return prev.filter(u => u !== user);
      }
      return [...prev, user];
    });
  };

  return (
    <Space direction="vertical" size={'middle'} style={{ width: '100%' }}>
      <TextArea
        placeholder="Task Name"
        size="middle"
        variant="borderless"
        style={{
          fontWeight: 600,
          fontSize: 17,
          marginBottom: 8,
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

      {/* description */}

      {/* tool: stage, assignee, duedate, priority, tags, more (time estimate, subtasks, checklist) */}
      <div
        style={{
          marginTop: 12,
        }}
      >
        <Space>
          {/* Stage */}
          {btnStage}

          <AssigneeActivity
            selectedUser={selectedAssignee}
            onToggleSelectUser={handleToggleSelectUser}
          />
          <DuedateActivity />
          <PriorityActivity
            onSelect={priority => {
              console.log('Selected priority:', priority);
            }}
          />
          {showActions.timeEstimate && <TimeEstimateActivity />}
          {/* More */}
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

      {/* SubTask */}
      {showActions.subtasks && <SubtaskActivity />}
      {showActions.checklist && <ChecklistActivity />}

      {openUploader && <FileAttachments view="internal" />}
    </Space>
  );
};

export default FormAddTask;
