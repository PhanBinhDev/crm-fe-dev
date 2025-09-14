import { IActivity } from '@/common/types';
import { DragDropType } from '@/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from 'antd';
import { useMemo, useState } from 'react';
import ToolbarActivityCard from './Toolbar';

interface ActivityCardProps {
  activity: IActivity;
  isPortal?: boolean;
  isCompletedStage?: boolean;
}

const ActivityCard = ({ activity, isPortal, isCompletedStage }: ActivityCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: activity.id,
      data: {
        type: DragDropType.KANBAN_CARD,
        activity,
      },
    });

  const styles: React.CSSProperties = useMemo(() => {
    const baseStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginBottom: '8px',
      cursor: 'pointer',
    };

    if (isDragging) {
      return {
        ...baseStyle,
        opacity: 0.5,
        border: '1px solid #1677ff',
        boxShadow: '0 4px 12px rgba(22, 119, 255, 0.15)',
      };
    }

    return {
      ...baseStyle,
      opacity: 1,
      border: isHovered ? '1px solid #cecece' : '1px solid #f0f0f0',
      boxShadow: isOver ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
      position: 'relative',
    };
  }, [transform, transition, isDragging, isHovered, isOver]);

  const showActions = useMemo(
    () => isHovered && !isDragging && !isOver && !isPortal,
    [isHovered, isDragging, isOver, isPortal],
  );

  return (
    <Card
      style={styles}
      styles={{
        body: {
          padding: '10px 12px',
        },
      }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={e => {
        setIsHovered(true);
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
        }
      }}
      onMouseLeave={e => {
        setIsHovered(false);
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
        }
      }}
    >
      <h4>{activity.name}</h4>
      <p>{activity.description}</p>
      {showActions && (
        <ToolbarActivityCard activity={activity} isCompletedStage={!!isCompletedStage} />
      )}
    </Card>
  );
};

export default ActivityCard;
