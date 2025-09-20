import { IActivity, IStage } from '@/common/types';
import { PlusOutlined } from '@ant-design/icons';
import { IconCircleCheckFilled, IconCircleDashed, IconShare } from '@tabler/icons-react';
import { Button, Input, Menu, type MenuProps, Tooltip, Typography } from 'antd';
import { useState } from 'react';

type MenuItem = Required<MenuProps>['items'][number];
const { Text } = Typography;

interface ActivityDetailSidebarProps {
  activity: IActivity;
  stage: IStage;
  onAddSubActivity?: (name: string) => void;
}

const ActivityDetailSidebar = ({
  activity,
  onAddSubActivity,
  stage,
}: ActivityDetailSidebarProps) => {
  const [addingSub, setAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const handleSave = () => {
    if (newSubName.trim()) {
      onAddSubActivity?.(newSubName.trim());
      setNewSubName('');
    }
    setAddingSub(false);
  };

  const subItems: MenuItem[] =
    activity?.subActivities?.map(sub => ({
      key: sub.id,
      label: <span style={{ fontSize: 12 }}>{sub.name}</span>,
      icon: <IconCircleDashed size={13} />,
    })) || [];

  if (addingSub) {
    subItems.push({
      key: 'new',
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconCircleDashed size={13} />
          <Input
            size="small"
            autoFocus
            bordered={false}
            value={newSubName}
            placeholder="Nhập tên subtask..."
            onChange={e => setNewSubName(e.target.value)}
            onPressEnter={handleSave}
            onBlur={handleSave}
            style={{
              fontSize: 12,
              padding: '2px 6px',
            }}
          />
        </div>
      ),
    });
  }

  const items: MenuItem[] = [
    {
      key: activity?.id,
      label: activity?.name,
      icon: <IconCircleCheckFilled size={16} color={stage.color} />,
      children: subItems,
    },
  ];

  const onClick: MenuProps['onClick'] = e => {
    console.log('click ', e);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 12px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconShare size={15} />
          <Text style={{ fontWeight: 600 }}>Subtasks</Text>
        </div>
        <Tooltip title="Thêm Subtask">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setAddingSub(true)}
          />
        </Tooltip>
      </div>

      <Menu
        onClick={onClick}
        style={{ width: 300 }}
        defaultOpenKeys={[activity?.id]}
        mode="inline"
        items={items}
        className="custom-menu"
      />
    </>
  );
};

export default ActivityDetailSidebar;
