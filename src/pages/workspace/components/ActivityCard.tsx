import { IActivity } from '@/common/types';
import { useSortable } from '@dnd-kit/sortable';
import { Card } from 'antd';

interface ActivityCardProps {
  activity: IActivity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: {
      type: 'activity',
      activity,
    },
  });

  return (
    <Card ref={setNodeRef} {...attributes} {...listeners}>
      <h4>{activity.name}</h4>
      <p>{activity.description}</p>
    </Card>
  );
};

export default ActivityCard;
