import { useOne, useUpdate } from '@refinedev/core';
import { Space, Switch, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Text } = Typography;

const GeneralSettings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data: workspaceData, isLoading } = useOne({
    resource: `workspaces`,
    id: workspaceId,
  });

  const { mutate: updateWorkspace, isLoading: isUpdating } = useUpdate();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (workspaceData?.data) {
      setChecked(workspaceData.data.visibility === 'private');
    }
  }, [workspaceData]);

  const handleToggle = (value: boolean) => {
    setChecked(value);

    updateWorkspace(
      {
        resource: `workspaces`,
        id: workspaceId,
        values: {
          name: workspaceData?.data.name,
          visibility: value ? 'private' : 'public',
        },
      },
      {
        onSuccess: () => {
          message.success(
            `Không gian làm việc đã chuyển sang chế độ ${value ? 'riêng tư' : 'công khai'}`,
          );
        },
        onError: () => {
          message.error('Có lỗi xảy ra khi cập nhật không gian làm việc');
          setChecked(!value);
        },
      },
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: 10, fontSize: 25 }}>Cài đặt chung</h2>
      <Space
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16 }}>Chuyển sang không gian làm việc riêng tư</Text>
        <Switch loading={isLoading || isUpdating} checked={checked} onChange={handleToggle} />
      </Space>
    </div>
  );
};

export default GeneralSettings;
