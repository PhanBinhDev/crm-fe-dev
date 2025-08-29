import { IActivity, IStage } from '@/common/types';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useUpdate } from '@refinedev/core';
import { Row } from 'antd';
import { useEffect, useState } from 'react';
import KanbanColumn from '@/pages/workspace/components/KanbanColumn';

interface KanbanViewProps {
  stages: IStage[];
  activities: IActivity[];
}

const KanbanView = ({ stages, activities }: KanbanViewProps) => {
  const [pendingUpdate, setPendingUpdate] = useState(false);

  const [columnOrder, setColumnOrder] = useState<string[]>(stages?.map(col => col.id) || []);

  useEffect(() => {
    if (stages && !pendingUpdate) {
      const newIds = stages.map(col => col.id);
      if (newIds.length !== columnOrder.length) {
        setColumnOrder(newIds);
      }
    }
  }, [stages, pendingUpdate]);

  const { mutate: updateStage } = useUpdate();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      const prevOrder = [...columnOrder];

      setColumnOrder(newOrder);
      setPendingUpdate(true);

      console.log('Dragging column:', active.id, 'to', over.id);

      updateStage(
        {
          resource: 'stages',
          id: active.id,
          values: { position: newIndex },
          mutationMode: 'optimistic',
        },
        {
          onSuccess: () => {
            setPendingUpdate(false);
          },
          onError: () => {
            setColumnOrder(prevOrder);
            setPendingUpdate(false);
          },
        },
      );
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '4px 4px 20px 4px',
        }}
      >
        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
          <Row
            gutter={16}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              minWidth: '100%',
            }}
          >
            {columnOrder.map(id => {
              const stage = stages.find(col => col.id === id);
              if (!stage) return null;

              const activityByStage = activities.filter(activity => activity.stageId === stage.id);

              return <KanbanColumn key={id} id={id} stage={stage} activities={activityByStage} />;
            })}
          </Row>
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default KanbanView;
