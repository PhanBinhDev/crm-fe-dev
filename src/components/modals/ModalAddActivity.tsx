import { FormAddActivityPayload, FormAddTaskData, ModalAction } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import FormAddReminder from '@/pages/workspace/components/FormAddReminder';
import FormAddTask from '@/pages/workspace/components/FormAddTask';
import NotificationActivityBtn from '@/pages/workspace/components/NotificationActivityBtn';
import { cleanPayload } from '@/utils/payload';
import { DownOutlined } from '@ant-design/icons';
import { useCreate, useInvalidate } from '@refinedev/core';
import { IconArrowDownRight, IconPaperclip, IconX } from '@tabler/icons-react';
import { Button, Dropdown, message, Modal, Space, Tabs, Tooltip } from 'antd';
import { useCallback, useRef, useState } from 'react';

const modalTabs = [
  { key: 'task', label: 'Hoạt động' },
  { key: 'reminder', label: 'Nhắc nhở' },
] as const;

type ModalTabKey = (typeof modalTabs)[number]['key'];

export interface FormAddTaskRef {
  submitForm: (action: ModalAction) => void;
}

const ModalAddActivity = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;
  const { isOpen, type, closeModal } = useModal();
  const isOpenModal = isOpen && type === 'ModalAddActivity';
  const formRef = useRef<FormAddTaskRef>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTabKey>('task');
  const [openUploader, setOpenUploader] = useState({
    task: false,
    reminder: false,
  });

  const invalidate = useInvalidate();
  const { mutate: createActivity, isPending: isPendingCreateActivity } = useCreate<FormAddTaskData>(
    {
      mutationOptions: {
        retry: false,
      },
    },
  );

  const handleCreate = useCallback(
    (action: ModalAction) => {
      formRef.current?.submitForm(action);
    },
    [formRef],
  );

  const handleFormSubmit = useCallback(
    ({
      data,
      action,
      callback,
    }: {
      data: FormAddActivityPayload;
      action: ModalAction;
      callback: () => void;
    }) => {
      switch (action) {
        case 'create-action': {
          createActivity(
            {
              resource: 'activities',
              values: cleanPayload(data),
            },
            {
              onSuccess: () => {
                callback();
                invalidate({
                  resource: 'activities',
                  invalidates: ['list'],
                });
                message.success('Tạo hoạt động thành công');
                closeModal();
              },
              onError: () => {
                message.error('Tạo hoạt động thất bại, vui lòng thử lại');
              },
            },
          );
        }
      }
    },
    [closeModal],
  );

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
      destroyOnHidden
      width={655}
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
              disabled={isPendingCreateActivity}
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

          {activeTab !== 'reminder' && workspaceId && (
            <NotificationActivityBtn workspaceId={workspaceId} />
          )}

          {activeTab !== 'reminder' ? (
            <Dropdown.Button
              type="primary"
              loading={isPendingCreateActivity}
              onClick={() => handleCreate('create-action')}
              menu={{
                items: [
                  {
                    key: 'create',
                    label: 'Tạo mới và mở',
                    onClick: () => handleCreate('create-open'),
                  },
                  {
                    key: 'create-another',
                    label: 'Tạo và tạo thêm',
                    onClick: () => handleCreate('create-another'),
                  },
                  {
                    key: 'duplicate',
                    label: 'Tạo và nhân bản',
                    onClick: () => handleCreate('create-duplicate'),
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
              placement="bottomRight"
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
              Tạo hoạt động
            </Dropdown.Button>
          ) : (
            <Button
              type="primary"
              onClick={() => handleCreate('create-action')}
              style={{
                borderRadius: 8,
              }}
              loading={isPendingCreateActivity}
            >
              Tạo nhắc nhở
            </Button>
          )}
        </Space>
      }
    >
      {activeTab === 'task' && (
        <FormAddTask openUploader={openUploader.task} ref={formRef} onSubmit={handleFormSubmit} />
      )}
      {activeTab === 'reminder' && <FormAddReminder openUploader={openUploader.reminder} />}
    </Modal>
  );
};

export default ModalAddActivity;
