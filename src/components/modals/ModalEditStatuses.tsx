import { IStage } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { MoreOutlined } from '@ant-design/icons';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import {
  IconCircleDashed,
  IconGripVertical,
  IconInfoSquareRounded,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Dropdown, Input, MenuProps, Modal, Tooltip, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { ColorPicker } from '../shared/ColorPicker';

const InlineEditor: React.FC<{
  defaultTitle?: string;
  defaultColor?: string;
  onSave: (title: string, color: string) => void;
  onCancel: () => void;
}> = ({ defaultTitle = '', defaultColor = '#9ca3af', onSave }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [color, setColor] = useState(defaultColor);
  const [_hovered, setHovered] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), color);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: '1px dashed #d4d4d8',
        borderRadius: 6,
        padding: '2px 6px',
        background: '#fff',
        marginBottom: 8,
        transition: 'border-color 0.2s ease',
        borderColor: '#d4d4d8',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <ColorPicker value={color} onChange={c => setColor(c)} size={18} />
        <IconCircleDashed
          size={16}
          color={color || '#9ca3af'}
          style={{
            position: 'relative',
            zIndex: 1,
            transform: 'translateY(-1px)',
          }}
        />
      </div>

      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Thêm trạng thái mới..."
        bordered={false}
        size="small"
        style={{
          flex: 1,
          boxShadow: 'none',
          background: 'transparent',
        }}
        onPressEnter={handleSave}
      />
      <Button
        size="small"
        onClick={handleSave}
        type="primary"
        style={{
          color: '#fff',
          borderRadius: 6,
          fontWeight: 500,
        }}
      >
        Tạo mới ↵
      </Button>
    </div>
  );
};

const StageItem: React.FC<{
  stage: IStage;
  onEditInline: (stage: IStage) => void;
  onDelete: (id: string) => void;
  onUpdateColor: (id: string, newColor: string) => void;
}> = ({ stage, onEditInline, onDelete, onUpdateColor }) => {
  const items: MenuProps['items'] = [
    { key: 'edit', label: 'Chỉnh sửa', onClick: () => onEditInline(stage) },
    {
      key: 'delete',
      label: 'Xóa',
      danger: true,
      disabled: stage.isBuiltIn,
      onClick: () => onDelete(stage.id),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        marginBottom: 6,
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconGripVertical size={14} color="#838383" style={{ cursor: 'grab' }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: stage.color || '#e5e7eb',
            color: stage.color ? '#fff' : '#333',
            padding: '1px 10px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          <ColorPicker
            size={14}
            value={stage.color}
            stageTitle={stage.title}
            onChange={newColor => onUpdateColor(stage.id, newColor)}
          />
          <Typography.Text style={{ color: stage.color ? '#fff' : '#333' }}>
            {stage.title}
          </Typography.Text>
        </div>
      </div>
      <Dropdown menu={{ items }} trigger={['click']}>
        <MoreOutlined style={{ cursor: 'pointer' }} />
      </Dropdown>
    </div>
  );
};

const StageSettings: React.FC = () => {
  const [addingGroup, setAddingGroup] = useState<string | undefined>();
  const [editingStage, setEditingStage] = useState<IStage | undefined>();
  const { currentWorkspace } = useWorkspaces();

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  const { mutate: createStage } = useCreate();
  const { mutate: updateStage } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = useMemo(
    () => (stagesData?.data || []).sort((a, b) => a.position - b.position),
    [stagesData?.data],
  );

  const groupConfig = [
    { key: 'not_started', label: 'Not started', info: 'Backlog, To Do.' },
    { key: 'active', label: 'Active', info: 'In Progress, Ready for Test.' },
    { key: 'done', label: 'Done', info: 'Complete, Done.' },
    { key: 'closed', label: 'Closed', info: 'Cancelled, Closed.' },
  ];

  const handleCreate = (groupKey: string, title: string, color: string) => {
    createStage({
      resource: 'stages',
      values: {
        title,
        color,
        stageGroup: groupKey,
        position: stages.length,
        workspaceId: currentWorkspace?.id,
      },
      successNotification: false,
    });
  };

  const handleUpdateColor = (id: string, newColor: string) => {
    updateStage({
      resource: 'stages',
      id,
      values: { color: newColor },
      mutationMode: 'optimistic',
      successNotification: false,
    });
  };

  const handleUpdateInline = (stage: IStage, title: string, color: string) => {
    updateStage({
      resource: 'stages',
      id: stage.id,
      values: { title, color },
      mutationMode: 'optimistic',
      successNotification: false,
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa trạng thái này?',
      onOk() {
        deleteStage({ resource: 'stages', id, mutationMode: 'optimistic' });
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 4 }}>
        Quản lý trạng thái
      </Typography.Title>
      <Typography.Text type="secondary">
        Thêm, sửa hoặc xóa trạng thái trong từng nhóm
      </Typography.Text>

      {groupConfig.map(group => {
        const groupStages = stages.filter(s => s.stageGroup === group.key);
        return (
          <div key={group.key} style={{ marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Typography.Text strong>{group.label}</Typography.Text>
                <Tooltip title={group.info}>
                  <IconInfoSquareRounded size={16} color="#888" />
                </Tooltip>
              </div>
              {group.key !== 'closed' && (
                <IconPlus
                  size={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setAddingGroup(prev => (prev === group.key ? undefined : group.key))
                  }
                />
              )}
            </div>

            <div>
              {groupStages.map(stage =>
                editingStage?.id === stage.id ? (
                  <InlineEditor
                    key={stage.id}
                    defaultTitle={stage.title}
                    defaultColor={stage.color || '#9ca3af'}
                    onSave={(t, c) => {
                      handleUpdateInline(stage, t, c);
                      setEditingStage(undefined);
                    }}
                    onCancel={() => setEditingStage(undefined)}
                  />
                ) : (
                  <StageItem
                    key={stage.id}
                    stage={stage}
                    onEditInline={setEditingStage}
                    onDelete={handleDelete}
                    onUpdateColor={handleUpdateColor}
                  />
                ),
              )}

              {addingGroup === group.key ? (
                <InlineEditor
                  onSave={(t, c) => {
                    handleCreate(group.key, t, c);
                    setAddingGroup(undefined);
                  }}
                  onCancel={() => setAddingGroup(undefined)}
                  defaultColor="#9ca3af"
                />
              ) : (
                group.key !== 'closed' && (
                  <Button
                    type="text"
                    icon={<IconPlus size={14} />}
                    style={{ width: '100%' }}
                    onClick={() => setAddingGroup(group.key)}
                  >
                    Thêm trạng thái mới
                  </Button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ModalEditStatuses = ({ open, onCancel }: { open: boolean; onCancel: () => void }) => {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={550} destroyOnClose>
      <StageSettings />
    </Modal>
  );
};

export default ModalEditStatuses;
