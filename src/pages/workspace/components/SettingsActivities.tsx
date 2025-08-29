import { KanbanBoardSettings } from '@/pages/workspaces/components/settings/KanbanBoardSettings';
import { IconSettings } from '@tabler/icons-react';
import { Button, Drawer, Tooltip } from 'antd';
import { useState } from 'react';

const SettingsActivities = () => {
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);

  return (
    <>
      <Tooltip title="Cài đặt bảng">
        <Button
          icon={<IconSettings size={16} color="#8c8c8c" />}
          style={{
            borderRadius: 8,
            background: '#f5f5f5',
            width: 36,
            height: 36,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          onClick={() => setSettingsDrawerVisible(true)}
        />
      </Tooltip>

      <Drawer
        title="Cài đặt Kanban Board"
        width={550}
        open={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
        mask={true}
        maskClosable={true}
        styles={{
          body: {
            padding: 0,
            height: '100%',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            position: 'fixed',
          },
        }}
      >
        <KanbanBoardSettings />
      </Drawer>
    </>
  );
};

export default SettingsActivities;
