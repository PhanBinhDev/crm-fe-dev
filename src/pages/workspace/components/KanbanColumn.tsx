import { StageGroup } from '@/common/enum/stage';
import { IActivity, IStage } from '@/common/types';
import ModalEditColumn from '@/components/modals/ModalEditColumn';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { DragDropType } from '@/constants';
import { useModal } from '@/hooks/useModal';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUpdate } from '@refinedev/core';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { Button, Card, Col, message, Space, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ModalEditStatuses from '../../../components/modals/ModalEditStatuses';
import ActivityCard from './ActivityCard';
import MoreOptionColumn from './MoreOptionColumn';

const { Text } = Typography;

interface KanbanColumnProps {
  id: string;
  stage: IStage;
  activities: IActivity[];
  allStages?: IStage[];
}

const KanbanColumn = ({ id, stage, activities, allStages = [] }: KanbanColumnProps) => {
  const [color, setColor] = useState<string | undefined>(stage.color);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(stage.title);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverHeader, setHoverHeader] = useState(false);

  const [editStatusesOpen, setEditStatusesOpen] = useState(false);

  const { mutate: updateStage } = useUpdate<IStage>();

  const { openModal } = useModal();
  const { isDragging, setNodeRef, transition, transform, isOver } = useSortable({
    id,
    data: {
      type: DragDropType.KANBAN_COLUMN,
      stage,
    },
  });

  useEffect(() => {
    if (collapsed && isOver) {
      setCollapsed(false);
    }
  }, [collapsed, isOver]);

  const rowOrder = useMemo(() => activities.map(activity => activity.id), [activities]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: '#fff',
    border: '1px solid #eeeaeaff',
    borderRadius: 8,
    opacity: isDragging ? 0.5 : 1,
    userSelect: 'none',
    width: '100%',
    maxWidth: '280px',
  };

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor);
      updateStage(
        {
          resource: 'stages',
          id: stage.id,
          values: {
            color: newColor,
            workspaceId: stage.workspaceId,
          },
          mutationMode: 'optimistic',
        },
        {
          onSuccess: () => {
            message.success('Cập nhật màu sắc cột thành công');
          },
          onError: () => {
            message.error('Cập nhật màu sắc cột thất bại');
          },
        },
      );
    },
    [stage, updateStage],
  );

  useEffect(() => {
    setColor(stage.color || '#1677ff');
  }, [stage.color]);

  useEffect(() => {
    setEditTitle(stage.title);
  }, [stage.title]);

  const isDirty = useMemo(() => {
    return editTitle !== stage.title || color !== stage.color;
  }, [editTitle, color, stage]);

  const isCompletedStage = useMemo(() => {
    return (
      stage.title.toLowerCase() === 'complete' &&
      stage.isBuiltIn &&
      stage.stageGroup === StageGroup.CLOSED
    );
  }, [stage]);

  return (
    <>
      <Col
        flex="0 0 280px"
        ref={setNodeRef}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 8,
        }}
      >
        <Card
          size="small"
          style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content',
            maxHeight: '100%',
          }}
          styles={{
            header: {
              padding: '0 6px 1px 6px',
              borderBottomColor: collapsed ? 'transparent' : '#dfddddff',
              flexShrink: 0,
            },
            body: {
              padding: collapsed ? '0 0 1px' : '12px',
              minHeight: collapsed ? 'auto' : '200px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0 4px 2px',
              }}
              onMouseEnter={() => setHoverHeader(true)}
              onMouseLeave={() => setHoverHeader(false)}
            >
              <Space size="small" style={{ flex: 1, gap: 4 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                    backgroundColor: color,
                    padding: '4px 8px 4px 6px',
                    borderRadius: '6px',
                  }}
                >
                  <ColorPicker value={color} onChange={handleColorChange} size={8} />
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: '13px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {stage.title.toLocaleUpperCase()}
                  </Text>
                </div>
                <div
                  style={{
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ecececff',
                    color: '#353636ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {activities.length || 0}
                </div>
              </Space>
              {hoverHeader && (
                <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn nhóm'}>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 6,
                      padding: 4,
                      minWidth: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setCollapsed(v => !v)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <IconChevronDown
                      size={18}
                      color="#8c8c8c"
                      style={{
                        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                </Tooltip>
              )}

              <MoreOptionColumn
                onEditColumn={() => setEditModalOpen(true)}
                collapsed={collapsed}
                onCollapseGroup={() => setCollapsed(v => !v)}
                onAddActivity={() => openModal('ModalAddActivity', { stageId: stage.id })}
                onEditStatuses={() => setEditStatusesOpen(true)}
              />
            </div>
          }
        >
          {!collapsed && (
            <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
              <div
                className="activities-list hidden-scrollbar"
                style={{
                  overflowY: 'auto',
                  height: '100%',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {rowOrder.length > 0 ? (
                  <>
                    {rowOrder.map(id => {
                      const activity = activities.find(activity => activity.id === id);
                      if (!activity) return null;

                      return (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          isCompletedStage={isCompletedStage}
                          stages={allStages}
                        />
                      );
                    })}
                    {/* Button addcard */}
                    <Button
                      onClick={() => openModal('ModalAddActivity', { stageId: stage.id })}
                      style={{
                        width: '100%',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '6px',
                        color: '#8c8c8c',
                        fontSize: '13px',
                        fontWeight: 400,
                        backgroundColor: '#fff',
                        padding: '8px 12px',
                        transition: 'all 0.2s ease',
                        borderRadius: '6px',
                      }}
                      type="text"
                      icon={<IconPlus size={14} stroke={1.5} color="#8c8c8c" />}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.color = '#595959';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#8c8c8c';
                      }}
                    >
                      <span style={{ marginLeft: '2px' }}>Thêm hoạt động</span>
                    </Button>
                  </>
                ) : (
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      margin: '8px 12px',
                      padding: '20px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#f6faff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 4,
                        transition: 'background 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#eaecef')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#f6faff')}
                      onClick={() => {
                        openModal('ModalAddActivity', {
                          stageId: stage.id,
                        });
                      }}
                    >
                      <IconPlus size={20} stroke={1.5} color="#bfbfbf" />
                    </button>
                    <span style={{ color: '#bfbfbf', fontSize: 15, fontStyle: 'italic' }}>
                      Không có hoạt động nào
                    </span>
                  </div>
                )}
              </div>
            </SortableContext>
          )}
        </Card>
      </Col>
      <ModalEditColumn
        open={editModalOpen}
        stageId={stage.id}
        editTitle={editTitle}
        color={color || ''}
        isDirty={isDirty}
        onCancel={() => {
          setEditModalOpen(false);
          setEditTitle(stage.title);
          setColor(stage.color || '#1677ff');
        }}
        onSuccess={() => {
          setEditModalOpen(false);
        }}
        setEditTitle={setEditTitle}
        setColor={setColor}
      />
      <ModalEditStatuses open={editStatusesOpen} onCancel={() => setEditStatusesOpen(false)} />
    </>
  );
};

export default KanbanColumn;
