import { IActivity, IStage } from '@/common/types';
import { DragDropType } from '@/constants';
import ActivityCard from '@/pages/workspace/components/ActivityCard';
import KanbanColumn from '@/pages/workspace/components/KanbanColumn';
import { KanbanProvider } from '@/contexts/kanban/KanbanContext';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useUpdate } from '@refinedev/core';
import { Row } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface KanbanViewProps {
  stages: IStage[];
  activities: IActivity[];
}

const KanbanView = ({ stages, activities }: KanbanViewProps) => {
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [activeColumn, setActiveColumn] = useState<IStage | null>(null);
  const [activeCard, setActiveCard] = useState<IActivity | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(stages?.map(col => col.id) || []);

  const [localActivities, setLocalActivities] = useState<IActivity[]>(activities);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  useEffect(() => {
    if (stages && !pendingUpdate) {
      const newIds = stages.map(col => col.id);
      if (newIds.length !== columnOrder.length) {
        setColumnOrder(newIds);
      }
    }
  }, [stages, pendingUpdate]);

  useEffect(() => {
    if (activities && !pendingUpdate) {
      const activitiesIds = activities
        .map(a => a.id)
        .sort()
        .join(',');
      const localActivitiesIds = localActivities
        .map(a => a.id)
        .sort()
        .join(',');

      if (activitiesIds !== localActivitiesIds) {
        setLocalActivities(activities);
      }
    }
  }, [activities, pendingUpdate, localActivities]);

  const { mutate: update } = useUpdate();

  // Context functions để ActivityCard có thể cập nhật localActivities
  const updateLocalActivity = useCallback((activityId: string, updates: Partial<IActivity>) => {
    setLocalActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, ...updates }
          : activity
      )
    );
  }, []);

  const removeLocalActivity = useCallback((activityId: string) => {
    setLocalActivities(prev => prev.filter(activity => activity.id !== activityId));
  }, []);

  const addLocalActivity = useCallback((activity: IActivity) => {
    setLocalActivities(prev => [...prev, activity]);
  }, []);

  const kanbanContextValue = {
    updateLocalActivity,
    removeLocalActivity,
    addLocalActivity,
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveColumn(null);
      setActiveCard(null);
      const { active, over } = event;
      if (!over || !active) return;

      const dragType = active.data.current?.type;

      if (dragType === DragDropType.KANBAN_COLUMN) {
        if (active.id == over?.id) return;
        const oldIndex = columnOrder.indexOf(String(active.id));
        const newIndex = columnOrder.indexOf(String(over.id));
        const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
        const prevOrder = [...columnOrder];
        setColumnOrder(newOrder);
        setPendingUpdate(true);
        update(
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
      } else if (dragType === DragDropType.KANBAN_CARD) {
        const activity = activeCard || localActivities.find(x => x.id === active.id);
        if (!activity || !over?.id) return;

        let targetStageId: string | undefined;
        let newPosition = 0;

        if (over.data.current?.type === DragDropType.KANBAN_COLUMN) {
          targetStageId = over.id as string;
          const activitiesInTargetColumn = localActivities.filter(a => a.stageId === targetStageId);
          newPosition = activitiesInTargetColumn.length;
        } else if (over.data.current?.type === DragDropType.KANBAN_CARD) {
          const overActivity = localActivities.find(x => x.id === over.id);
          if (!overActivity) return;

          targetStageId = overActivity.stageId;
          const activitiesInTargetColumn = localActivities
            .filter(a => a.stageId === targetStageId)
            .sort((a, b) => a.position - b.position);

          newPosition = activitiesInTargetColumn.findIndex(a => a.id === over.id);

          if (activity.stageId === targetStageId) {
            const currentIndex = activitiesInTargetColumn.findIndex(a => a.id === activity.id);
            if (currentIndex < newPosition) {
              newPosition = newPosition;
            }
          }
        }

        if (!targetStageId) return;

        const prevActivities = [...localActivities];

        if (activity.stageId !== targetStageId) {
          setLocalActivities(prev => {
            const updated = prev.map(a =>
              a.id === activity.id ? { ...a, stageId: targetStageId!, position: newPosition } : a,
            );
            return updated;
          });
        } else {
          setLocalActivities(prev => {
            const activitiesInStage = prev
              .filter(a => a.stageId === targetStageId && a.id !== activity.id)
              .sort((a, b) => a.position - b.position);

            activitiesInStage.splice(newPosition, 0, { ...activity, position: newPosition });

            const updatedActivitiesInStage = activitiesInStage.map((a, index) => ({
              ...a,
              position: index,
            }));

            const otherActivities = prev.filter(a => a.stageId !== targetStageId);
            return [...otherActivities, ...updatedActivitiesInStage];
          });
        }

        setPendingUpdate(true);
        update(
          {
            resource: 'activities',
            id: activity.id,
            values: {
              stageId: targetStageId,
              position: newPosition,
            },
            mutationMode: 'optimistic',
          },
          {
            onSuccess: () => {
              setPendingUpdate(false);
            },
            onError: () => {
              setLocalActivities(prevActivities);
              setPendingUpdate(false);
            },
          },
        );
      }
    },
    [columnOrder, localActivities, setColumnOrder, setPendingUpdate, update, activeCard],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const dragType = active.data.current?.type;

      if (dragType === DragDropType.KANBAN_COLUMN) {
        setActiveColumn(stages.find(col => col.id === active.id) || null);
        return;
      }
      if (dragType === DragDropType.KANBAN_CARD) {
        setActiveCard(active.data.current?.activity || null);
        return;
      }
    },
    [setActiveColumn, setActiveCard, stages],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      const isActiveAnActivity = active.data.current?.type === DragDropType.KANBAN_CARD;
      const isOverActivity = over.data.current?.type === DragDropType.KANBAN_CARD;
      const isOverAColumn = over.data.current?.type === DragDropType.KANBAN_COLUMN;

      if (!isActiveAnActivity) return;

      const activeActivity = localActivities.find(x => x.id === activeId);
      if (!activeActivity) return;

      let targetStageId: string | undefined;

      if (isOverAColumn) {
        targetStageId = overId as string;
      } else if (isOverActivity) {
        const overActivity = localActivities.find(x => x.id === overId);
        if (!overActivity) return;
        targetStageId = overActivity.stageId;
      }

      if (targetStageId && activeActivity.stageId !== targetStageId) {
        setLocalActivities(prev =>
          prev.map(activity =>
            activity.id === activeId ? { ...activity, stageId: targetStageId! } : activity,
          ),
        );
      }
    },
    [localActivities],
  );

  return (
    <KanbanProvider value={kanbanContextValue}>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      >
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          height: 'calc(100vh - 250px)',
        }}
      >
        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
          <Row
            gutter={16}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              minWidth: '100%',
              height: '100%',
            }}
          >
            {columnOrder.map(id => {
              const stage = stages.find(col => col.id === id);
              if (!stage) return null;

              const activityByStage = localActivities
                .filter(activity => activity.stageId === stage.id)
                .sort((a, b) => a.position - b.position);

              return <KanbanColumn key={id} id={id} stage={stage} activities={activityByStage} allStages={stages} />;
            })}
          </Row>
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <KanbanColumn
              id={activeColumn.id}
              stage={activeColumn}
              activities={localActivities.filter(activity => activity.stageId === activeColumn.id)}
              allStages={stages}
            />
          )}
          {activeCard && <ActivityCard activity={activeCard} isPortal />}
        </DragOverlay>,
        document.body,
      )}
      </DndContext>
    </KanbanProvider>
  );
};

export default KanbanView;
