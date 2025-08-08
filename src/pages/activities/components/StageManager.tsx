import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useList, useCreate, useUpdate, useDelete } from '@refinedev/core';

const { Title } = Typography;

interface Stage {
  id: string;
  title: string;
  position: number;
}

interface StageModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: Stage;
  loading?: boolean;
}

const StageModal: React.FC<StageModalProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onFinish(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa giai đoạn' : 'Thêm giai đoạn mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tên giai đoạn"
          rules={[{ required: true, message: 'Vui lòng nhập tên giai đoạn' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="position"
          label="Vị trí"
          rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const StageManager: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | undefined>();

  const { data: stagesData, refetch } = useList<Stage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const { mutate: createStage, isLoading: createLoading } = useCreate();
  const { mutate: updateStage, isLoading: updateLoading } = useUpdate();
  const { mutate: deleteStage } = useDelete();

  const stages = stagesData?.data || [];

  const handleCreate = (values: any) => {
    createStage(
      {
        resource: 'stages',
        values,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          refetch();
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
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setEditingStage(undefined);
          refetch();
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa giai đoạn này?',
      onOk() {
        deleteStage(
          {
            resource: 'stages',
            id,
          },
          {
            onSuccess: () => {
              refetch();
            },
          },
        );
      },
    });
  };

  const handleEdit = (stage: Stage) => {
    setEditingStage(stage);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên giai đoạn',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      sorter: (a: Stage, b: Stage) => a.position - b.position,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Stage) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={4}>Quản lý giai đoạn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Thêm giai đoạn
        </Button>
      </div>

      <Table columns={columns} dataSource={stages} rowKey="id" pagination={false} size="small" />

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
    </>
  );
};
