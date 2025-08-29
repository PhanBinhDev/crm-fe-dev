import { IActivity, IStage } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { DragOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUpdate } from '@refinedev/core';
import { Card, Col, Input, message, Modal, Space, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MoreOptionColumn from './MoreOptionColumn';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import ActivityCard from './ActivityCard';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/common/enum/user';

const { Text } = Typography;

interface KanbanColumnProps {
  id: string;
  stage: IStage;
  activities: IActivity[];
}

const KanbanColumn = ({ id, stage, activities }: KanbanColumnProps) => {
  const [color, setColor] = useState<string | undefined>(stage.color);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(stage.title);
  const [rowOrder, setRowOrder] = useState<string[]>(activities?.map(row => row.id) || []);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverHeader, setHoverHeader] = useState(false);

  const { user, isLoading: isLoadingUser } = useAuth();

  // Mutate
  const { mutate: updateStage } = useUpdate<IStage>();

  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef: setSortableRef,
    transition,
    transform,
  } = useSortable({
    id,
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: {
      type: 'kanban-column',
      stage,
    },
  });

  useEffect(() => {
    if (activities.length) {
      const newIds = activities.map(act => act.id);
      if (newIds.length !== rowOrder.length) {
        setRowOrder(activities.map(activity => activity.id));
      }
    }
  }, [activities]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging
      ? '0 6px 24px rgba(24, 144, 255, 0.18)'
      : isOver
      ? '0 0 0 2px #1677ff'
      : '0 2px 8px rgba(0,0,0,0.06)',
    background: isDragging ? '#e6f4ff' : isOver ? '#f0faff' : '#fff',
    border: isDragging ? '1px solid #1677ff' : '1px solid #f0f0f0',
    borderRadius: 8,
    opacity: isDragging ? 0.8 : 1,
    userSelect: 'none',
    width: '100%',
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

  const setRefs = (element: HTMLElement | null) => {
    setSortableRef(element);
    setDroppableRef(element);
  };

  const canDragColumn = useMemo(() => {
    if (!user || isLoadingUser) return false;
    return [UserRole.CNBM, UserRole.TM].includes(user.role);
  }, [user?.role, isLoadingUser]);

  return (
    <Col flex="0 0 280px" ref={setRefs}>
      <Card
        size="small"
        style={style}
        styles={{
          header: {
            padding: canDragColumn ? '0 6px 1px 12px' : '0 6px 1px 6px',
            borderBottomColor: collapsed ? 'transparent' : '#f0f0f0',
          },
          body: {
            padding: collapsed ? '0 0 1px' : '12px',
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
            <Space size="small" style={{ flex: 1 }}>
              {canDragColumn && (
                <div
                  {...attributes}
                  {...listeners}
                  style={{
                    cursor: 'grab',
                    padding: '2px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    background: isDragging ? '#e6f4ff' : undefined,
                  }}
                  title="Kéo để sắp xếp cột"
                >
                  <DragOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                </div>
              )}

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
            </Space>
            {hoverHeader && (
              <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn nhóm'}>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'none',
                    borderRadius: 6,
                    padding: 4,
                    minWidth: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    marginRight: 2,
                  }}
                  onClick={() => setCollapsed(v => !v)}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <IconChevronDown
                    size={18}
                    color="#8c8c8c"
                    style={{
                      transform: collapsed ? 'rotate(-180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
              </Tooltip>
            )}

            <MoreOptionColumn
              onEditColumn={() => setEditModalOpen(true)}
              collapsed={collapsed}
              onCollapseGroup={() => setCollapsed(v => !v)}
            />
          </div>
        }
      >
        {!collapsed && (
          <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
            <div className="activities-list">
              {rowOrder.length > 0 ? (
                rowOrder.map(id => {
                  const activity = activities.find(activity => activity.id === id);
                  if (!activity) return null;

                  return <ActivityCard key={activity.id} activity={activity} />;
                })
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
                      width: 40,
                      height: 40,
                      borderRadius: 12,
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
                    onClick={() => {}}
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

      <Modal
        open={editModalOpen}
        width={340}
        title={<span style={{ fontWeight: 600, fontSize: 16 }}>Sửa cột</span>}
        onCancel={() => setEditModalOpen(false)}
        centered
        onOk={() => {
          updateStage({
            resource: 'stages',
            id: stage.id,
            values: { title: editTitle, color },
            mutationMode: 'optimistic',
          });
          setEditModalOpen(false);
        }}
        okText="Lưu"
        styles={{ body: { padding: '6px 0' } }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 6,
                display: 'block',
                fontSize: 13,
                color: '#888',
              }}
            >
              Tên cột
            </label>
            <Input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Nhập tên cột mới"
              maxLength={40}
              style={{
                fontSize: 14,
                borderRadius: 6,
                padding: '4px 8px',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 6,
                fontSize: 13,
                color: '#888',
              }}
            >
              Màu sắc
            </label>
            <ColorPicker value={color} onChange={setColor} size={32} radius={6} />
          </div>
        </div>
      </Modal>
    </Col>
  );
};

export default KanbanColumn;
