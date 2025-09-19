import { IActivity, IStage } from '@/common/types';
import { IconCheck } from '@tabler/icons-react';
import { Button, Tooltip, App } from 'antd';
import ToolbarMoreAction from './ToolbarMoreAction';
import { ActivityService } from '@/services/api/activity';
import { useKanbanContext } from '@/contexts/kanban/KanbanContext';

interface ToolbarActivityCardProps {
  activity: IActivity;
  isCompletedStage: boolean;
  stages?: IStage[];
}

const ToolbarActivityCard = ({ activity, isCompletedStage, stages = [] }: ToolbarActivityCardProps) => {
  const { message } = App.useApp();
  
  // Chỉ sử dụng context khi available
  let updateLocalActivity: any = null;
  try {
    const context = useKanbanContext();
    updateLocalActivity = context.updateLocalActivity;
  } catch (error) {
    // Context không available, không làm gì
  }

  const handleMarkComplete = async () => {
    try {
      console.log('Starting mark complete for activity:', activity.id);
      
      // Tìm cột Complete (cột cuối cùng)
      const sortedStages = [...stages].sort((a, b) => (a.position || 0) - (b.position || 0));
      const completedStage = sortedStages[sortedStages.length - 1];
      
      console.log('Found completed stage:', completedStage);

      // OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức (chỉ khi có context)
      if (updateLocalActivity) {
        if (completedStage) {
          updateLocalActivity(activity.id, {
            stageId: completedStage.id,
            status: 'completed'
          });
          console.log('Optimistically updated to stage:', completedStage.id, completedStage.title);
        } else {
          updateLocalActivity(activity.id, {
            status: 'completed'
          });
        }
      }

      // API call trong background
      if (completedStage) {
        await ActivityService.updateActivity(activity.id, {
          stageId: completedStage.id
        } as any);
        
        await ActivityService.updateStatus(activity.id, 'completed');
      } else {
        await ActivityService.markComplete(activity.id);
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      
      // Rollback optimistic update nếu API thất bại (chỉ khi có context)
      if (updateLocalActivity) {
        const sortedStages = [...stages].sort((a, b) => (a.position || 0) - (b.position || 0));
        const completedStage = sortedStages[sortedStages.length - 1];
        
        if (completedStage) {
          updateLocalActivity(activity.id, {
            stageId: activity.stageId,
            status: activity.status
          });
        } else {
          updateLocalActivity(activity.id, {
            status: activity.status
          });
        }
      }
      
      message.error('Đánh dấu hoàn thành thất bại');
    }
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
            onClick={(e) => {
              console.log('Button clicked!');
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
