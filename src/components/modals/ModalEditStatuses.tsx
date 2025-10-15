import { IStage } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconGripVertical, IconInfoSquareRounded, IconPlus } from '@tabler/icons-react';
import { Button, Dropdown, Form, Input, MenuProps, Modal, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import { ColorPicker } from '../shared/ColorPicker';

interface ModalEditStatusesProps {
  open: boolean;
  onCancel: () => void;
}

const StageItem: React.FC<{
  stage: IStage;
  onEdit: (stage: IStage) => void;
  onDelete: (id: string) => void;
  onUpdateColor: (id: string, newColor: string) => void;
}> = ({ stage, onEdit, onDelete, onUpdateColor }) => {
  const items: MenuProps['items'] = [
    { key: 'edit', label: 'Chỉnh sửa', onClick: () => onEdit(stage) },
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
        borderRadius: 6,
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
            gap: 5,
            backgroundColor: stage.color || '#e5e7eb',
            color: stage.color ? '#fff' : '#333',
            padding: '1px 8px',
            borderRadius: 6,
            fontWeight: 500,
            transition: 'all 0.3s ease',
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
const StageModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: Partial<IStage>) => void;
  initialValues?: Partial<IStage>;
  loading?: boolean;
}> = ({ visible, onCancel, onFinish, initialValues, loading }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={visible}
      title={initialValues ? 'Chỉnh sửa trạng thái' : 'Thêm mới trạng thái'}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
        <Form.Item
          label="Tên trạng thái"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
        >
          <Input placeholder="Ví dụ: TO DO, IN PROGRESS..." />
        </Form.Item>

        {/* Bỏ chọn màu */}
        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// =================== StageSettings ===================
const StageSettings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<IStage | undefined>();
  const [defaultGroup, setDefaultGroup] = useState<string | undefined>();
  const { currentWorkspace } = useWorkspaces();

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  const { mutate: createStage, isPending: createLoading } = useCreate();
  const { mutate: updateStage, isPending: updateLoading } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = (stagesData?.data || []).sort((a, b) => a.position - b.position);

  const groupConfig = [
    {
      key: 'not_started',
      label: 'Chưa bắt đầu',
      info: 'Các trạng thái chưa được thực hiện hoặc lên kế hoạch, ví dụ: Backlog, To Do.',
    },
    {
      key: 'active',
      label: 'Đang hoạt động',
      info: 'Các trạng thái đang được xử lý hoặc theo dõi, ví dụ: In Progress, Ready for Test.',
    },
    {
      key: 'done',
      label: 'Đã hoàn thành',
      info: 'Các trạng thái đã hoàn thành công việc, ví dụ: Complete, Done.',
    },
    {
      key: 'closed',
      label: 'Đã đóng',
      info: 'Các trạng thái đã đóng hoặc không còn theo dõi, ví dụ: Cancelled, Closed.',
    },
  ];
  const handleUpdateColor = (id: string, newColor: string) => {
    updateStage({
      resource: 'stages',
      id,
      values: { color: newColor },
      mutationMode: 'optimistic',
      successNotification: false,
    });
  };

  // =================== CREATE ===================
  const handleCreate = (values: any) => {
    if (!defaultGroup) return;

    const groupStages = stages.filter(s => s.stageGroup === defaultGroup);
    const baseColor = groupStages.length > 0 ? groupStages[0].color : '#808080';

    createStage(
      {
        resource: 'stages',
        values: {
          ...values,
          stageGroup: defaultGroup,
          color: baseColor,
          position: stages.length,
          workspaceId: currentWorkspace?.id,
        },
        successNotification: false,
      },
      {
        onSettled: () => {
          setModalVisible(false);
          setDefaultGroup(undefined);
        },
      },
    );
  };

  // =================== UPDATE ===================
  const handleUpdate = (values: any) => {
    if (!editingStage) return;

    const groupStages = stages.filter(s => s.stageGroup === editingStage.stageGroup);
    const baseColor = groupStages.length > 0 ? groupStages[0].color : '#808080';

    updateStage(
      {
        resource: 'stages',
        id: editingStage.id,
        values: {
          ...values,
          color: baseColor,
        },
        mutationMode: 'optimistic',
        successNotification: false,
      },
      {
        onSettled: () => {
          setModalVisible(false);
          setEditingStage(undefined);
        },
      },
    );
  };

  // =================== DELETE ===================
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa trạng thái này?',
      onOk() {
        deleteStage({ resource: 'stages', id, mutationMode: 'optimistic' });
      },
    });
  };

  const handleEdit = (stage: IStage) => {
    setEditingStage(stage);
    setModalVisible(true);
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: '4px' }}>
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
                <PlusOutlined
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDefaultGroup(group.key);
                    setModalVisible(true);
                    setEditingStage(undefined);
                  }}
                />
              )}
            </div>

            {/* Stage Items */}
            <div>
              {groupStages.map(stage => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateColor={handleUpdateColor}
                />
              ))}

              {group.key !== 'closed' && (
                <Button
                  type="text"
                  onClick={() => {
                    setDefaultGroup(group.key);
                    setModalVisible(true);
                    setEditingStage(undefined);
                  }}
                  styles={{
                    icon: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  }}
                  icon={<IconPlus size={14} />}
                  style={{
                    width: '100%',
                  }}
                >
                  Thêm trạng thái mới
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <StageModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStage(undefined);
          setDefaultGroup(undefined);
        }}
        onFinish={editingStage ? handleUpdate : handleCreate}
        initialValues={editingStage}
        loading={createLoading || updateLoading}
      />
    </div>
  );
};

const ModalEditStatuses = ({ open, onCancel }: ModalEditStatusesProps) => {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={550} destroyOnHidden>
      <StageSettings />
    </Modal>
  );
};

export default ModalEditStatuses;
