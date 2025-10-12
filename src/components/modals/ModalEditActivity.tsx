import { ActivityType } from '@/common/enum/activity';
import { IActivity } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import ActivityChecklist from '@/pages/workspace/components/ActivityDetails/ActivityChecklist';
import ActivityDetailRightSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailRightSidebar';
import ActivityDetailSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailSidebar';
import ActivityMainContent from '@/pages/workspace/components/ActivityDetails/ActivityMainContent';
import ActivitySubtask from '@/pages/workspace/components/ActivityDetails/ActivitySubtask';
import ProgressBar from '@/pages/workspace/components/ActivityDetails/ProgressBar';
import SelectActivityType from '@/pages/workspace/components/SelectActivityType';
import { calculateProgress } from '@/utils/activity';
import { useInvalidate, useOne, useUpdate } from '@refinedev/core';
import {
  IconCalendar,
  IconCornerLeftUp,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftCollapseFilled,
  IconShare,
  IconX,
} from '@tabler/icons-react';
import { Button, Input, Layout, Modal, Skeleton, Space, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ActivityMainContentSkeleton from '../skeletons/ActivityMainContentSkeleton';
import ProgressBarSkeleton from '../skeletons/ProgressBarSkeleton';
import { SelectActivityTypeSkeleton } from '../skeletons/SelectActivityTypeSkeleton';

const { Text } = Typography;
const { TextArea } = Input;
const { Header, Sider, Content } = Layout;

export type ActivityItemType = 'activity' | 'subactivity';

export type SelectedActivityItem = {
  type: ActivityItemType;
  data: IActivity;
};

const ModalEditActivity = () => {
  const { data, closeModal, setData } = useModal();
  const [collapsedLeft, setCollapsedLeft] = useState(true);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isOverlay, setIsOverlay] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedActivityItem | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentNarrow, setIsContentNarrow] = useState(false);
  const { activity: activityFromModal } = data || {};
  const [showActions, setShowActions] = useState({
    edit: false,
    duplicate: false,
    delete: false,
  });

  const originalNameRef = useRef<string>('');
  const originalDescriptionRef = useRef<string>('');

  const invalidate = useInvalidate();
  const {
    data: activityData,
    isLoading: isLoadingActivity,
    refetch,
  } = useOne<IActivity>({
    resource: 'activities',
    id: activityFromModal?.id,
    queryOptions: { enabled: !!activityFromModal?.id },
  });

  

  const { mutate: updateActivity } = useUpdate<IActivity>({
    resource: 'activities',
    id: selectedItem?.data?.id,
    mutationMode: 'optimistic',
    invalidates: ['list'],
    mutationOptions: {
      onSuccess: () => {
        const currentType = selectedItem?.type;

        invalidate({
          resource: `activities/${activityFromModal.id}/logs`,
          invalidates: ['list'],
        });

        if (currentType === 'activity') {
          invalidate({
            resource: 'activities',
            id: activityFromModal.id,
            invalidates: ['detail'],
          });
        }

        invalidate({
          resource: `activities/${activityFromModal.id}/sub-activities`,
          invalidates: ['list'],
        });

        if (selectedItem?.type === 'subactivity') {
          invalidate({
            resource: 'activities',
            id: selectedItem.data.id,
            invalidates: ['detail'],
          });
        }
      },
    },
  });

  const activity = useMemo(() => {
    if (!activityData?.data || isLoadingActivity) return {} as IActivity;

    return activityData.data;
  }, [activityData, isLoadingActivity]);

  useEffect(() => {
    if (activity) {
      setSelectedItem({
        type: 'activity',
        data: {
          ...activity,
          progress: calculateProgress(activity),
        },
      });

      originalNameRef.current = activity.name || '';
      originalDescriptionRef.current = activity.description || '';
    }
  }, [activity, setSelectedItem]);

  const checkContentWidth = useCallback(() => {
    if (contentRef.current) {
      setIsContentNarrow(contentRef.current.offsetWidth < 600);
    }
  }, []);

  const checkWidth = useCallback(() => {
    if (layoutRef.current) {
      const width = layoutRef.current.offsetWidth;
      setIsOverlay(width < 768);
    }
  }, []);

  useEffect(() => {
    checkWidth();
    checkContentWidth();
    window.addEventListener('resize', checkWidth);
    window.addEventListener('resize', checkContentWidth);

    return () => {
      window.removeEventListener('resize', checkWidth);
      window.removeEventListener('resize', checkContentWidth);
    };
  }, [collapsedLeft, isOverlay]);

  const handleSelectItem = useCallback(
    (item: { type: ActivityItemType; data: IActivity }) => {
      setSelectedItem({
        type: item.type,
        data: {
          ...item.data,
          progress: calculateProgress(item.data),
        },
      });

      originalNameRef.current = item.data.name || '';
      originalDescriptionRef.current = item.data.description || '';
    },
    [setSelectedItem],
  );

  const handleSelectSubtask = useCallback(
    (subtask: IActivity) => {
      setSelectedItem({
        type: 'subactivity',
        data: {
          ...subtask,
          progress: calculateProgress(subtask),
        },
      });

      originalNameRef.current = subtask.name || '';
      originalDescriptionRef.current = subtask.description || '';
    },
    [setSelectedItem],
  );

  const updateActivityData = useCallback(
    (updates: Partial<IActivity>) => {
      console.log('update', { ...updates });

      setSelectedItem(prev => {
        if (!prev) return prev;
        const hasChanges = !_.isEqual(_.pick(prev.data, Object.keys(updates)), updates);

        console.log('nothing changed');

        if (!hasChanges) return prev;

        console.log('run changed');

        return {
          ...prev,
          data: {
            ...prev.data,
            ...updates,
          },
        };
      });
    },
    [setSelectedItem],
  );

  useEffect(() => {
    if (!selectedItem && activity && Object.keys(activity).length > 0) {
      setSelectedItem({
        type: 'activity',
        data: {
          ...activity,
          progress: calculateProgress(activity),
        },
      });

      originalNameRef.current = activity.name || '';
      originalDescriptionRef.current = activity.description || '';
    }
  }, [selectedItem, activity]);

  const onTypeChange = useCallback(
    (type: ActivityType) => {
      if (!selectedItem) return;

      updateActivityData({ type });

      updateActivity({ values: { type } });
    },
    [updateActivity],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const isEmpty = !newValue.trim();

      if (isEmpty) {
        e.currentTarget.style.borderColor = '#ff4d4f';
      } else {
        e.currentTarget.style.borderColor = 'transparent';
      }

      updateActivityData({ name: newValue });
    },
    [updateActivityData],
  );

  const handleNameBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = 'transparent';

      const currentValue = selectedItem?.data.name?.trim() ?? '';
      const originalValue = originalNameRef.current.trim();

      if (currentValue === '') {
        e.currentTarget.style.borderColor = '#ff4d4f';
        return;
      }

      e.currentTarget.style.borderColor = 'transparent';

      if (
        selectedItem &&
        currentValue !== originalValue &&
        !(currentValue === '' && originalValue === '')
      ) {
        updateActivity({
          values: {
            name: selectedItem.data.name,
          },
        });
        originalNameRef.current = selectedItem.data.name || '';
      }
    },
    [selectedItem, updateActivity],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      updateActivityData({ description: newValue });
    },
    [updateActivityData],
  );

  const handleDescriptionBlur = useCallback(() => {
    const currentValue = selectedItem?.data.description?.trim() ?? '';
    const originalValue = originalDescriptionRef.current.trim();

    if (
      selectedItem &&
      currentValue !== originalValue &&
      !(currentValue === '' && originalValue === '')
    ) {
      updateActivity({
        values: {
          description: selectedItem.data.description,
        },
      });
      originalDescriptionRef.current = selectedItem.data.description || '';
    }
  }, [selectedItem, updateActivity]);

  const renderContent = useMemo(() => {
    if (!selectedItem) return null;

    const { type, data: itemData } = selectedItem;
    const isMainActivity = type === 'activity';

    return (
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          margin: '0 auto',
          padding: '30px 24px 48px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          gap: 16,
        }}
      >
        {isLoadingActivity ? (
          <>
            <ProgressBarSkeleton />
            <SelectActivityTypeSkeleton />
            <Skeleton.Input
              active
              style={{
                width: '100%',
                height: 39,
                borderRadius: 6,
              }}
              size="large"
            />
            <ActivityMainContentSkeleton
              isContentNarrow={isContentNarrow}
              isEvent={selectedItem?.data?.type === ActivityType.EVENT}
            />

            <Skeleton.Input
              active
              style={{
                width: '100%',
                height: 76,
                borderRadius: 6,
              }}
              size="large"
            />
          </>
        ) : (
          <>
            <ProgressBar activity={itemData} />

            {!isMainActivity && (
              <Button
                type="text"
                size="small"
                style={{
                  alignSelf: 'flex-start',
                  padding: '0 6px',
                  borderRadius: 6,
                  gap: 4,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                icon={<IconCornerLeftUp size={14} color="#838383" />}
                onClick={() =>
                  handleSelectItem({
                    type: 'activity',
                    data: {
                      ...activity,
                      progress: calculateProgress(activity),
                    },
                  })
                }
              >
                Quay lại{' '}
                <span>
                  {activity?.name?.length > 20
                    ? activity?.name.slice(0, 20) + '...'
                    : activity?.name}
                </span>
              </Button>
            )}

            <SelectActivityType id={itemData.id} value={itemData.type} onChange={onTypeChange} />

            <TextArea
              placeholder={`Nhập tên ${itemData.type === ActivityType.TASK ? 'nhiệm vụ' : 'sự kiện'}...`}
              size="middle"
              variant="borderless"
              style={{
                fontWeight: 600,
                fontSize: 22,
                border: '1px solid transparent',
                paddingLeft: 4,
                lineHeight: '37px',
                paddingTop: 0,
                paddingBottom: 0,
              }}
              value={selectedItem.data.name}
              onChange={handleNameChange}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onMouseEnter={e => {
                if (selectedItem.data.name.trim()) {
                  e.currentTarget.style.background = '#f0f0f0';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
              onBlur={handleNameBlur}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              name="name"
            />

            <ActivityMainContent
              itemData={itemData}
              isContentNarrow={isContentNarrow}
              onUpdate={updateActivity}
              setFormData={updateActivityData as any}
            />

            <TextArea
              placeholder={`Nhập mô tả...`}
              size="middle"
              variant="borderless"
              style={{
                fontWeight: 600,
                fontSize: 16,
                border: '1px solid #f0f0f0',
                paddingLeft: 4,
                lineHeight: '22px',
              }}
              value={selectedItem.data.description}
              onChange={handleDescriptionChange}
              autoSize={{ minRows: 3, maxRows: 6 }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'transparent';
              }}
              onBlur={handleDescriptionBlur}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.currentTarget.blur();
                }
              }}
              name="description"
            />
          </>
        )}

        {/* Sub task */}
        {isMainActivity && (
          <ActivitySubtask activity={itemData} onSelectSubtask={handleSelectSubtask} />
        )}

        {/* Checklist */}
        <ActivityChecklist activity={itemData} />

        {/* Attachments */}
      </div>
    );
  }, [
    selectedItem,
    updateActivityData,
    isContentNarrow,
    isLoadingActivity,
    activity,
    updateActivity,
  ]);

  return (
    <Modal
      open
      onCancel={() => {
        closeModal();
        setData({});
      }}
      width="95vw"
      closeIcon={false}
      destroyOnHidden
      footer={null}
      centered
      style={{
        top: 0,
        padding: 0,
      }}
      styles={{
        body: {
          height: '90vh',
          maxHeight: '95vh',
          padding: 0,
          overflow: 'hidden',
        },
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
        },
      }}
    >
      <Layout style={{ height: '100%' }} ref={layoutRef}>
        <Header
          style={{
            textAlign: 'center',
            height: 48,
            padding: '12px 8px',
            lineHeight: '48px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Tooltip title={collapsedLeft ? 'Mở subtask sidebar' : 'Ẩn subtask sidebar'}>
            <Button
              type="text"
              icon={
                collapsedLeft ? (
                  <IconLayoutSidebarLeftCollapse size={16} stroke={1.5} color="#838383" />
                ) : (
                  <IconLayoutSidebarLeftCollapseFilled size={16} stroke={1.5} color="#838383" />
                )
              }
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              onClick={() => setCollapsedLeft(!collapsedLeft)}
            />
          </Tooltip>

          <Space
            align="center"
            styles={{
              item: {
                fontSize: 14,
                color: '#838383',
                display: 'flex',
                alignItems: 'center',
              },
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCalendar style={{ color: '#8c8c8c', fontSize: 12 }} size={12} />
              <Text style={{ fontSize: 13, display: 'block' }}>
                Ngày tạo:{' '}
                {new Date(activity?.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
              <Text style={{ fontSize: 13, display: 'block' }}>
                {new Date(activity?.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>

            <Button
              styles={{
                icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
              }}
              icon={<IconShare size={16} />}
            >
              Chia sẻ
            </Button>
            <Tooltip title="Đóng">
              <Button
                type="text"
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                icon={<IconX size={16} color="#838383" />}
                onClick={closeModal}
              />
            </Tooltip>
          </Space>
        </Header>

        <Layout
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            maxHeight: 'calc(90vh - 48px)',
            minHeight: 0,
          }}
        >
          <Sider
            collapsed={collapsedLeft}
            collapsible
            trigger={null}
            width={300}
            collapsedWidth={0}
            style={{
              background: '#f9f9f9',
              borderRight: '1px solid #f0f0f0',
              overflow: 'hidden',
              ...(isOverlay
                ? {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 10,
                    transition: 'all 0.2s ease',
                    transform: collapsedLeft ? 'translateX(-100%)' : 'translateX(0)',
                    boxShadow: collapsedLeft
                      ? 'none'
                      : '0 10px 15px -3px rgba(0, 0, 0, .106), 0 4px 6px -4px rgba(0, 0, 0, .106)',
                  }
                : {
                    position: 'relative',
                    transition: 'width 0.2s ease',
                  }),
            }}
          >
            <ActivityDetailSidebar
              activity={activity}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              refetchActivity={refetch}
              showActions={showActions}
              onShowAction={action =>
                setShowActions(prev => ({
                  ...prev,
                  [action]: !prev[action],
                }))
              }
            />
          </Sider>

          {/* Main Content */}
          <Content
            ref={contentRef}
            style={{
              textAlign: 'center',
              minHeight: 120,
              color: '#000',
              background: '#fff',
              overflow: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              transition: 'margin 0.2s ease',
              maxHeight: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
            className="hide-scrollbar"
          >
            {renderContent}
          </Content>
          <ActivityDetailRightSidebar
            activityId={activity.id}
            isOverlay={isOverlay}
            collapsedLeft={collapsedLeft}
            setCollapsedLeft={setCollapsedLeft}
          />
        </Layout>
      </Layout>
    </Modal>
  );
};

export default ModalEditActivity;
