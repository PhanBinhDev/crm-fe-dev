import React, { useState } from 'react';
import { Modal, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useList, useCreate, useUpdate, useDelete } from '@refinedev/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { IStage } from '@/common/types';
import { StageModal } from '@/pages/activities/components/modals/StageModal';
import { SortableStageItem } from './SortableStageItem';
import '@/styles/dropdown.css';

export const StageSettings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<IStage | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const { mutate: createStage, isPending: createLoading } = useCreate();
  const { mutate: updateStage, isPending: updateLoading } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = (stagesData?.data || []).sort((a, b) => a.position - b.position);

  // Sensors cho drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleCreate = (values: any) => {
    createStage(
      {
        resource: 'stages',
        values: {
          ...values,
          position: stages.length,
        },
        successNotification: false,
      },
      {
        onSettled: () => {
          setModalVisible(false);
        },
      },
    );
  };

  const handleUpdate = (values: any) => {
    if (!editingStage) return;

    updateStage(
      {
        resource: 'stages',
        id: editingStage.id,
        values,
        mutationMode: 'optimistic',
        successNotification: false,
        // optimisticUpdateMap: {
        //   many(previous, valuesArray) {
        //     console.log('Optimistic update for stages:', valuesArray);
        //     console.log('Previous stages:', previous);

        //   },
        // },
      },
      {
        onSettled: () => {
          setModalVisible(false);
          setEditingStage(undefined);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa trạng thái này?',
      onOk() {
        deleteStage({
          resource: 'stages',
          id,
          mutationMode: 'optimistic',
        });
      },
    });
  };

  const handleEdit = (stage: IStage) => {
    setEditingStage(stage);
    setModalVisible(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const oldIndex = stages.findIndex(stage => stage.id === activeId);
    const newIndex = stages.findIndex(stage => stage.id === overId);

    if (oldIndex !== newIndex) {
      // Calculate new order for all affected stages
      const newStagesOrder = arrayMove(stages, oldIndex, newIndex);

      // Update all stages that have position changes
      newStagesOrder.forEach((stage, index) => {
        if (stage.position !== index) {
          updateStage({
            resource: 'stages',
            id: stage.id,
            values: {
              ...stage,
              position: index,
            },
            mutationMode: 'optimistic',
            successNotification: false,
          });
        }
      });
    }
  };

  const activeStage = activeId ? stages.find(stage => stage.id === activeId) : null;

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
            Quản lý trạng thái
          </Typography.Title>
          <Typography.Text type="secondary">
            Kéo và thả để sắp xếp lại các trạng thái
          </Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Thêm trạng thái
        </Button>
      </div>

      {/* Stages Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            minHeight: '300px',
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fafafa',
          }}
        >
          <SortableContext
            items={stages.map(stage => stage.id)}
            strategy={verticalListSortingStrategy}
          >
            {stages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  color: '#8c8c8c',
                  textAlign: 'center',
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <PlusOutlined
                  style={{ fontSize: '40px', marginBottom: '16px', color: '#d9d9d9' }}
                />
                <Typography.Title
                  level={5}
                  style={{ color: '#8c8c8c', margin: 0, marginBottom: '8px' }}
                >
                  Chưa có trạng thái nào
                </Typography.Title>
                <Typography.Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                  Nhấn "Thêm trạng thái" để tạo trạng thái đầu tiên
                </Typography.Text>
              </div>
            ) : (
              <>
                {stages.map(stage => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                {/* Add status button ở cuối */}
                <div
                  onClick={() => setModalVisible(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1.5px dashed #d9d9d9',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8c8c8c',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#1890ff';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#d9d9d9';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <PlusOutlined style={{ marginRight: '8px', fontSize: '14px' }} />
                  <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    Thêm trạng thái
                  </Typography.Text>
                </div>
              </>
            )}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeStage ? (
            <div
              style={{
                width: '100%',
                maxWidth: '98%',
                cursor: 'grabbing',
                backgroundColor: '#fff',
                border: '2px solid #1890ff',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                opacity: 0.95,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#8c8c8c', fontSize: '14px', marginRight: '12px' }}>⋮⋮</span>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff4d4f',
                    marginRight: '12px',
                  }}
                />
                <Typography.Text style={{ fontSize: '14px', fontWeight: 500 }}>
                  {activeStage.title}
                </Typography.Text>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <StageModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStage(undefined);
        }}
        onFinish={editingStage ? handleUpdate : handleCreate}
        initialValues={editingStage}
        loading={createLoading || updateLoading}
      />
    </div>
  );
};
