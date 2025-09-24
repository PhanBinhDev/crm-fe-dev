import React, { useState } from "react";
import {
  Modal,
  Typography,
  Dropdown,
  Button,
  Form,
  Input,
  MenuProps,
  Tooltip,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { useCreate, useDelete, useList, useUpdate } from "@refinedev/core";
import { IStage } from "@/common/types";

interface ModalEditStatusesProps {
  open: boolean;
  onCancel: () => void;
}

// =================== StageItem ===================
const StageItem: React.FC<{
  stage: IStage;
  onEdit: (stage: IStage) => void;
  onDelete: (id: string) => void;
}> = ({ stage, onEdit, onDelete }) => {
  const items: MenuProps["items"] = [
    { key: "edit", label: "Chỉnh sửa", onClick: () => onEdit(stage) },
    {
      key: "delete",
      label: "Xóa",
      danger: true,
      disabled: stage.isBuiltIn,
      onClick: () => onDelete(stage.id),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        marginBottom: 6,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <HolderOutlined style={{ color: "#aaa", cursor: "grab" }} />
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: stage.color,
          }}
        />
        <Typography.Text>{stage.title}</Typography.Text>
      </div>
      <Dropdown menu={{ items }} trigger={["click"]}>
        <MoreOutlined style={{ cursor: "pointer" }} />
      </Dropdown>
    </div>
  );
};

// =================== StageModal ===================
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
      title={initialValues ? "Chỉnh sửa trạng thái" : "Thêm mới trạng thái"}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Form.Item
          label="Tên trạng thái"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên trạng thái" }]}
        >
          <Input placeholder="Ví dụ: TO DO, IN PROGRESS..." />
        </Form.Item>

        {/* Bỏ chọn màu */}

        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? "Cập nhật" : "Thêm mới"}
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

  const { data: stagesData } = useList<IStage>({
    resource: "stages",
    pagination: { pageSize: 100 },
    sorters: [{ field: "position", order: "asc" }],
  });

  const { mutate: createStage, isPending: createLoading } = useCreate();
  const { mutate: updateStage, isPending: updateLoading } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = (stagesData?.data || []).sort(
    (a, b) => a.position - b.position
  );

  const groupConfig = [
    { key: "not_started", label: "Not started" },
    { key: "active", label: "Active" },
    { key: "done", label: "Done" },
    { key: "closed", label: "Closed" },
  ];

  // =================== CREATE ===================
  const handleCreate = (values: any) => {
    if (!defaultGroup) return;

    const groupStages = stages.filter((s) => s.stageGroup === defaultGroup);
    const baseColor =
      groupStages.length > 0 ? groupStages[0].color : "#808080";

    createStage(
      {
        resource: "stages",
        values: {
          ...values,
          stageGroup: defaultGroup,
          color: baseColor,
          position: stages.length,
        },
        successNotification: false,
      },
      {
        onSettled: () => {
          setModalVisible(false);
          setDefaultGroup(undefined);
        },
      }
    );
  };

  // =================== UPDATE ===================
  const handleUpdate = (values: any) => {
    if (!editingStage) return;

    const groupStages = stages.filter(
      (s) => s.stageGroup === editingStage.stageGroup
    );
    const baseColor =
      groupStages.length > 0 ? groupStages[0].color : "#808080";

    updateStage(
      {
        resource: "stages",
        id: editingStage.id,
        values: {
          ...values,
          color: baseColor, 
        },
        mutationMode: "optimistic",
        successNotification: false,
      },
      {
        onSettled: () => {
          setModalVisible(false);
          setEditingStage(undefined);
        },
      }
    );
  };

  // =================== DELETE ===================
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa trạng thái này?",
      onOk() {
        deleteStage({ resource: "stages", id, mutationMode: "optimistic" });
      },
    });
  };

  const handleEdit = (stage: IStage) => {
    setEditingStage(stage);
    setModalVisible(true);
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: "4px" }}>
        Quản lý trạng thái
      </Typography.Title>
      <Typography.Text type="secondary">
        Thêm, sửa hoặc xóa trạng thái trong từng nhóm
      </Typography.Text>

      {groupConfig.map((group) => {
        const groupStages = stages.filter((s) => s.stageGroup === group.key);
        const groupColor =
          groupStages.length > 0 ? groupStages[0].color : "#808080";

        return (
          <div key={group.key} style={{ marginTop: 24 }}>
            {/* Group Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: groupColor,
                  }}
                />
                <Typography.Text strong>{group.label}</Typography.Text>
                <Tooltip title="Thông tin nhóm">
                  <InfoCircleOutlined style={{ fontSize: 12, color: "#888" }} />
                </Tooltip>
              </div>
              {group.key !== "closed" && (
                <PlusOutlined
                  style={{ cursor: "pointer" }}
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
              {groupStages.map((stage) => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}

              {group.key !== "closed" && (
                <div
                  onClick={() => {
                    setDefaultGroup(group.key);
                    setModalVisible(true);
                    setEditingStage(undefined);
                  }}
                  style={{
                    padding: "6px 8px",
                    border: "1px dashed #d9d9d9",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#8c8c8c",
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  + Add status
                </div>
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

// =================== ModalEditStatuses (export) ===================
const ModalEditStatuses = ({ open, onCancel }: ModalEditStatusesProps) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <StageSettings />
    </Modal>
  );
};

export default ModalEditStatuses;
