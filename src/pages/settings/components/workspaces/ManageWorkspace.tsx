import Spinner from '@/components/ui/Spinner';
import { useCustomMutation } from '@refinedev/core';
import {
  IconDeviceFloppy,
  IconInfoSquareRounded,
  IconPlus,
  IconSettings,
  IconUsersPlus,
} from '@tabler/icons-react';
import { Button, Card } from 'antd';
import { useMemo, useRef, useState } from 'react';
import WorkspaceInfo from './WorkspaceInfo';
import WorkspaceMembers from './WorkspaceMembers';
import WorkspaceSettingsInner from './WorkspaceSettingsInner';

type WorkspaceTab = 'info' | 'members' | 'settings';

const tabItems = [
  {
    key: 'info',
    label: 'Thông tin workspace',
    icon: <IconInfoSquareRounded size={14} />,
  },
  {
    key: 'members',
    label: 'Thành viên',
    icon: <IconUsersPlus size={14} />,
  },
  {
    key: 'settings',
    label: 'Cài đặt',
    icon: <IconSettings size={14} />,
  },
];

const ManageWorkspace = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('info');
  const infoFormRef = useRef<any>(null);
  const [showSave, setShowSave] = useState(false);

  const handleInfoFormChange = (changed: boolean) => {
    setShowSave(changed);
  };

  const { mutate: updateWorkspace, isPending: isUpdating } = useCustomMutation();

  const renderHeaderButton = useMemo(() => {
    if (activeTab === 'info') {
      return showSave ? (
        <Button
          type="primary"
          icon={isUpdating ? <Spinner size={16} color="#fff" /> : <IconDeviceFloppy size={16} />}
          onClick={() => infoFormRef.current?.submit?.(updateWorkspace)}
          styles={{
            icon: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}
          style={{
            padding: '4px 12px',
            borderRadius: 8,
            gap: 6,
            opacity: isUpdating ? 0.6 : 1,
          }}
        >
          Lưu
        </Button>
      ) : null;
    }
    if (activeTab === 'members') {
      return (
        <Button
          type="primary"
          icon={<IconPlus size={14} />}
          onClick={() => {}}
          styles={{
            icon: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}
          style={{
            padding: '4px 12px',
            borderRadius: 8,
            gap: 4,
          }}
        >
          Mời thành viên
        </Button>
      );
    }
    return null;
  }, [activeTab, showSave, isUpdating, updateWorkspace]);

  return (
    <div
      style={{
        padding: 12,
        height: '100%',
      }}
    >
      <Card
        title={
          <>
            <div
              style={{
                display: 'flex',
                gap: 4,
              }}
            >
              {tabItems.map(tab => (
                <Button
                  key={tab.key}
                  type="text"
                  onClick={() => setActiveTab(tab.key as WorkspaceTab)}
                  style={{
                    background: activeTab === tab.key ? '#f1f1f1' : 'transparent',
                    color: '#222',
                    marginRight: 0,
                    boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.04)' : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: 8,
                    padding: '4px 12px',
                    gap: 4,
                  }}
                  onMouseEnter={e => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = '#f1f1f1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  icon={tab.icon}
                  styles={{
                    icon: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            {renderHeaderButton}
          </>
        }
        styles={{
          header: {
            padding: 0,
            maxHeight: 48,
            minHeight: 0,
          },
          title: {
            padding: 8,
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          },
          body: {
            padding: 12,
            maxHeight: '100%',
            flex: 1,
            transition: 'all 0.3s',
          },
        }}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'info' && (
          <WorkspaceInfo
            ref={infoFormRef}
            onFormChange={handleInfoFormChange}
            onUpdate={updateWorkspace}
          />
        )}
        {activeTab === 'members' && <WorkspaceMembers />}
        {activeTab === 'settings' && <WorkspaceSettingsInner />}
      </Card>
    </div>
  );
};

export default ManageWorkspace;
