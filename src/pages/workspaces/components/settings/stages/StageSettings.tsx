import { IStage } from '@/common/types';
import { StageModal } from '@/pages/workspaces/components/modals/StageModal';
import '@/styles/dropdown.css';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { Button, Modal, Typography } from 'antd';
import React, { useState } from 'react';
import { StageItem } from './SortableStageItem';

export const StageSettings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<IStage | undefined>();
  const [defaultGroup, setDefaultGroup] = useState<string | undefined>();

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const { mutate: createStage, isPending: createLoading } = useCreate();
  const { mutate: updateStage, isPending: updateLoading } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = (stagesData?.data || []).sort((a, b) => a.position - b.position);

  const groupConfig = [
    { key: 'not_started', label: 'Chưa bắt đầu' },
    { key: 'active', label: 'Đang thực hiện' },
    { key: 'done', label: 'Hoàn thành' },
    { key: 'closed', label: 'Đã đóng' },
  ];

  const handleCreate = (values: any) => {
    createStage(
      {
        resource: 'stages',
        values: {
          ...values,
          stageGroup: defaultGroup, 
          position: stages.length,
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

  const handleUpdate = (values: any) => {
    if (!editingStage) return;

    updateStage(
      {
        resource: 'stages',
        id: editingStage.id,
        values,
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

  return (
    <div style={{ height: '100%'}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
            Quản lý trạng thái
          </Typography.Title>
          <Typography.Text type="secondary">
            Thêm, sửa hoặc xóa trạng thái trong từng nhóm
          </Typography.Text>
        </div>
      </div>

      {groupConfig.map(group => {
        const groupStages = stages.filter(s => s.stageGroup === group.key);

        return (
          <div key={group.key} style={{ marginBottom: 32 }}>
            <Typography.Text strong>{group.label}</Typography.Text>
            <div style={{paddingTop: 8}}>
              {groupStages.map(stage => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}

              {group.key !== 'closed' && (
                <div
                  onClick={() => {
                    setDefaultGroup(group.key);
                    setModalVisible(true);
                    setEditingStage(undefined);
                  }}
                  style={{
                    marginTop: 8,
                    padding: '8px',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: '#8c8c8c',
                  }}
                >
                  + Thêm mới trạng thái
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={() => {
            stages.forEach((stage, index) => {
              updateStage({
                resource: 'stages',
                id: stage.id,
                values: { ...stage, position: index },
                mutationMode: 'optimistic',
                successNotification: false,
              });
            });
          }}
        >
          Lưu thay đổi
        </Button>
      </div>

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
