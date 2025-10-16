import { IActivity, IStage } from '@/common/types';
import { useKanbanContext } from '@/contexts/kanban/KanbanContext';
import { useActivityActions } from '@/hooks/useActivityActions';
import { IconCheck } from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import ToolbarMoreAction from './ToolbarMoreAction';

interface ToolbarActivityCardProps {
  activity: IActivity;
  isCompletedStage: boolean;
  stages?: IStage[];
}

const ToolbarActivityCard = ({
  activity,
  isCompletedStage,
  stages = [],
}: ToolbarActivityCardProps) => {
  const { markComplete } = useActivityActions();

  // Chỉ sử dụng context khi available
  let updateLocalActivity: any = null;
  try {
    const context = useKanbanContext();
    updateLocalActivity = context.updateLocalActivity;
  } catch (error) {
    // Context không available, không làm gì
  }

  const handleMarkComplete = () => {
    markComplete(activity, stages, updateLocalActivity);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 2,
        display: 'flex',
        gap: '4px',
        height: 32,
        width: 'auto',
        background: '#fff',
        borderRadius: 6,
        border: '1px solid #cecece',
        boxShadow: '0 1px 3px rgba(0, 0, 0, .106), 0 1px 2px -1px rgba(0, 0, 0, .106)',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      {!isCompletedStage && (
        <Tooltip title="Đánh dấu hoàn thành">
          <Button
            size="small"
            type="text"
            icon={<IconCheck size={14} />}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={e => {
              e.stopPropagation();
              handleMarkComplete();
            }}
          />
        </Tooltip>
      )}
      <ToolbarMoreAction activity={activity} />
    </div>
  );
};

export default ToolbarActivityCard;
