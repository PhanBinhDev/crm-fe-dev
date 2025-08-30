import { IActivity } from '@/common/types';
import { DragDropType } from '@/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from 'antd';
import { useMemo } from 'react';

interface ActivityCardProps {
  activity: IActivity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
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
      border: '1px solid #f0f0f0',
      boxShadow: isOver ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
    };
  }, [transform, transition, isDragging]);

  return (
    <Card style={styles} ref={setNodeRef} {...attributes} {...listeners}>
      <h4>{activity.name}</h4>
      <p>{activity.description}</p>
    </Card>
  );
};

export default ActivityCard;
