import { IStage } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import FormAddEvent from '@/pages/workspace/components/FormAddEvent';
import FormAddReminder from '@/pages/workspace/components/FormAddReminder';
import FormAddTask from '@/pages/workspace/components/FormAddTask';
import NotificationActivityBtn from '@/pages/workspace/components/NotificationActivityBtn';
import { DownOutlined } from '@ant-design/icons';
import { useOne } from '@refinedev/core';
import { IconArrowDownRight, IconPaperclip, IconX } from '@tabler/icons-react';
import { Button, Dropdown, Modal, Space, Tabs, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTabKey>('task');

  const [openUploader, setOpenUploader] = useState({
    task: false,
    event: false,
    reminder: false,
  });

  const { data: stageData, isLoading: isLoadingStage } = useOne<IStage>({
    resource: 'stages',
    id: stageId,
    queryOptions: {
      enabled: !!stageId && activeTab !== 'reminder',
    },
  });

  const btnStage = useMemo(() => {
    return (
      <button
        style={{
          backgroundColor: stageData?.data?.color ?? '#838383',
          borderColor: stageData?.data?.color ?? '#838383',
          minWidth: 50,
          borderRadius: 6,
          height: 24,
          padding: '0 8px',
          border: 'none',
          outline: 'none',
          color: '#fff',
          cursor: isLoadingStage ? 'not-allowed' : 'pointer',
        }}
      >
        {stageData?.data?.title ?? 'Chọn giai đoạn'}
      </button>
    );
  }, [isLoadingStage, stageData]);

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
          <Space
            style={{
              gap: 4,
            }}
          >
            {/* Minimize draft */}
            <Tooltip title="Thu nhỏ bản nháp">
              <Button
                type="text"
                style={{
                  borderRadius: 8,
                  marginBottom: 2,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                icon={
                  <IconArrowDownRight
                    size={15}
                    style={{
                      color: '#888',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  />
                }
              />
            </Tooltip>

            <Button
              type="text"
              style={{
                borderRadius: '100%',
                marginBottom: 2,
                background: '#0000000a',
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
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.color = '#222';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000000a';
                e.currentTarget.style.color = '#888';
              }}
            />
          </Space>
        </div>
      }
      open={isOpenModal}
      onCancel={closeModal}
      onOk={() => {}}
      destroyOnHidden
      width={620}
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
        },
        body: {
          padding: '12px 24px',
        },
        footer: {
          padding: 12,
          borderTop: '1px solid #f0f0f0',
        },
      }}
      footer={
        <Space style={{ gap: 6 }}>
          <Tooltip title="Đính kèm tập tin">
            <Button
              onClick={() => {
                setOpenUploader(prev => ({ ...prev, [activeTab]: !prev[activeTab] }));
              }}
              type="text"
              style={{
                width: 'fit-content',
                padding: '0 8px',
                color: '#838383',
                background: openUploader[activeTab] ? '#f5f5f5' : '',
                gap: 4,
                borderRadius: 8,
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#838383',
                },
              }}
              icon={<IconPaperclip size={16} />}
            />
          </Tooltip>

          {activeTab !== 'reminder' && <NotificationActivityBtn />}

          {activeTab !== 'reminder' ? (
            <Dropdown.Button
              type="primary"
              onClick={closeModal}
              menu={{
                items: [
                  {
                    key: 'create',
                    label: 'Tạo mới và mở',
                    onClick: () => {
                      closeModal();
                    },
                  },
                  {
                    key: 'create-another',
                    label: 'Tạo và tạo thêm',
                    onClick: () => {
                      closeModal();
                    },
                  },
                  {
                    key: 'duplicate',
                    label: 'Tạo và nhân bản',
                    onClick: () => {
                      closeModal();
                    },
                  },
                ],
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 8,
              }}
              destroyOnHidden
              placement="bottomLeft"
              icon={
                <DownOutlined
                  size={16}
                  style={{
                    transition: 'transform 0.2s',
                    transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              }
              trigger={['click']}
              onOpenChange={setMenuOpen}
            >
              Tạo{' '}
              {activeTab === 'task' ? 'công việc' : activeTab === 'event' ? 'sự kiện' : 'nhắc nhở'}
            </Dropdown.Button>
          ) : (
            <Button
              type="primary"
              onClick={closeModal}
              style={{
                borderRadius: 8,
              }}
            >
              Tạo nhắc nhở
            </Button>
          )}
        </Space>
      }
    >
      {activeTab === 'task' && <FormAddTask openUploader={openUploader.task} btnStage={btnStage} />}
      {activeTab === 'event' && <FormAddEvent openUploader={openUploader.event} />}
      {activeTab === 'reminder' && <FormAddReminder openUploader={openUploader.reminder} />}
    </Modal>
  );
};

export default ModalAddActivity;
