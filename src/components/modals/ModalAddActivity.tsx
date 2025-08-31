import { useModal } from '@/hooks/useModal';
import { IconX } from '@tabler/icons-react';
import { Button, Modal, Tabs } from 'antd';
import { useState } from 'react';

const modalTabs = [
  { key: 'task', label: 'Task' },
  { key: 'event', label: 'Event' },
  { key: 'reminder', label: 'Reminder' },
] as const;

type ModalTabKey = (typeof modalTabs)[number]['key'];

const ModalAddActivity = () => {
  const { isOpen, type, data, closeModal } = useModal();
  const isOpenModal = isOpen && type === 'ModalAddActivity';
  const { stageId } = data ?? {};

  const [activeTab, setActiveTab] = useState<ModalTabKey>('task');

  return (
    <Modal
      title={
        <div
          style={{
            padding: '12px 12px 0',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={key => setActiveTab(key as ModalTabKey)}
            items={modalTabs.map(tab => ({
              key: tab.key,
              label: (
                <span
                  style={{
                    color: activeTab === tab.key ? '#222' : '#838383',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                >
                  {tab.label}
                </span>
              ),
            }))}
            tabBarStyle={{
              marginBottom: 12,
              height: 32,
              minHeight: 32,
              display: 'flex',
              alignItems: 'flex-start',
              background: '#fff',
              borderRadius: 8,
              gap: 24,
              width: '100%',
            }}
            style={{
              background: '#fff',
              borderRadius: 8,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              gap: 24,
            }}
          />
          <Button
            type="text"
            style={{
              borderRadius: '100%',
              marginBottom: 2,
            }}
            onClick={closeModal}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            icon={
              <IconX
                size={15}
                style={{
                  color: '#888',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              />
            }
          />
        </div>
      }
      open={isOpenModal}
      onCancel={closeModal}
      onOk={() => {}}
      destroyOnHidden
      width={600}
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
        },
        body: {
          padding: 12,
        },
        footer: {
          padding: 12,
          borderTop: '1px solid #f0f0f0',
        },
      }}
    >
      Hello {stageId}
    </Modal>
  );
};

export default ModalAddActivity;
