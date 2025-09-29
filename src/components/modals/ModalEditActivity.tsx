import { ActivityType } from '@/common/enum/activity';
import { IActivity, IStage } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import ActivityDetailRightSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailRightSidebar';
import ActivityDetailSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailSidebar';
import ActivityMainContent from '@/pages/workspace/components/ActivityDetails/ActivityMainContent';
import SelectActivityType from '@/pages/workspace/components/SelectActivityType';
import { useInvalidate, useList, useOne, useUpdate } from '@refinedev/core';
import {
  IconCalendar,
  IconChevronDown,
  IconCornerLeftUp,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftCollapseFilled,
  IconShare,
  IconX,
} from '@tabler/icons-react';
import { Button, Card, Input, Layout, Modal, Progress, Space, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

const { Text } = Typography;
const { TextArea } = Input;
const { Header, Sider, Content } = Layout;

export type ActivityItemType = 'activity' | 'subactivity';

export type SelectedActivityItem = {
  type: ActivityItemType;
  data: IActivity;
};

const ModalEditActivity = () => {
  const { isOpen, type, data, closeModal, setData } = useModal();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOpenModal = isOpen && type === 'ModalEditActivity';
  const [collapsedLeft, setCollapsedLeft] = useState(true);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isOverlay, setIsOverlay] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedActivityItem | null>(null);
  const [formData, setFormData] = useState<Partial<IActivity>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentNarrow, setIsContentNarrow] = useState(false);
  const { activity: activityFromModal } = data || {};
  const [showActions, setShowActions] = useState({
    edit: false,
    duplicate: false,
    delete: false,
  });

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

  const { data: stagesData, isLoading: isLoadingStages } = useList<IStage>({
    resource: 'stages',
    filters: [
      {
        field: 'workspaceId',
        operator: 'eq',
        value: activityFromModal?.workspaceId,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: { enabled: !!activityFromModal?.workspaceId },
  });

  const { mutate: updateActivity } = useUpdate<IActivity>({
    resource: 'activities',
    id: activityFromModal?.id,
    mutationMode: 'optimistic',
    invalidates: ['list'],
    mutationOptions: {
      onSuccess: () => {
        invalidate({
          resource: `activities/${activityFromModal?.id}/logs`,
          invalidates: ['list'],
        });
        invalidate({
          resource: 'activities',
          id: activityFromModal?.id,
          invalidates: ['detail'],
        });
      },
    },
  });

  const activity = useMemo(() => {
    if (!activityData?.data || isLoadingActivity) return {} as IActivity;

    return activityData.data;
  }, [activityData, isLoadingActivity]);

  const stages = useMemo(() => {
    if (!stagesData?.data || isLoadingStages) return [] as IStage[];

    return stagesData.data;
  }, [stagesData, isLoadingStages]);

  useEffect(() => {
    if (activity && isOpenModal) {
      setSelectedItem({
        type: 'activity',
        data: activity,
      });
      setFormData(activity);
    }
  }, [activity, isOpenModal, setFormData]);

  useEffect(() => {
    const checkContentWidth = () => {
      if (contentRef.current) {
        setIsContentNarrow(contentRef.current.offsetWidth < 600);
      }
    };
    const checkWidth = () => {
      if (layoutRef.current) {
        const width = layoutRef.current.offsetWidth;
        setIsOverlay(width < 768);
      }
    };

    checkWidth();
    checkContentWidth();
    window.addEventListener('resize', checkWidth);
    window.addEventListener('resize', checkContentWidth);

    return () => {
      window.removeEventListener('resize', checkWidth);
      window.removeEventListener('resize', checkContentWidth);
    };
  }, [collapsedLeft, isOverlay]);

  const handleSelectItem = (item: { type: ActivityItemType; data: IActivity }) => {
    setSelectedItem(item);
    setFormData(item.data);
  };

  const renderContent = useMemo(() => {
    if (!selectedItem) {
      setSelectedItem({
        type: 'activity',
        data: activity,
      });

      return;
    }

    const { type, data: itemData } = selectedItem;
    const isMainActivity = type === 'activity';
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          margin: '0 auto',
          padding: '36px 24px 48px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          gap: 16,
        }}
      >
        {/* Progress bar */}
        <Card
          styles={{
            body: {
              padding: '8px',
              paddingBottom: 4,
              borderRadius: 10,
              boxShadow: 'none',
              width: '100%',
            },
          }}
          style={{
            boxShadow: 'none',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Tiến độ hoàn thành
            </Typography.Title>

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
              icon={<IconChevronDown size={14} color="#838383" />}
            />
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Progress
              percent={48}
              showInfo={false}
              strokeColor="#4caf50"
              strokeWidth={8}
              style={{ borderRadius: 8, height: 'fit-content' }}
            />
          </div>
        </Card>

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
              setSelectedItem({
                type: 'activity',
                data: activity,
              })
            }
          >
            Quay lại{' '}
            <span>
              {activity?.name?.length > 20 ? activity?.name.slice(0, 20) + '...' : activity?.name}
            </span>
          </Button>
        )}

        <SelectActivityType isLoading={isLoadingActivity} activity={itemData} />

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
          value={formData.name}
          onChange={e => {
            const newValue = e.target.value;
            setFormData(prev => ({ ...prev, name: newValue }));
          }}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f0f0f0';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
          onFocus={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#f0f0f0';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'transparent';
            if (formData.name !== itemData.name && formData.name?.trim()) {
              updateActivity({
                values: {
                  name: formData.name,
                },
              });
            }
          }}
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
          stages={stages}
          onUpdate={updateActivity}
          setFormData={setFormData}
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
          value={formData.description}
          onChange={e => {
            const newValue = e.target.value;
            setFormData(prev => ({ ...prev, description: newValue }));
          }}
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
          onBlur={() => {
            if (formData.description !== itemData.description && formData.description?.trim()) {
              updateActivity({
                values: {
                  description: formData.description,
                },
              });
            }
          }}
          name="description"
        />
      </div>
    );
  }, [
    selectedItem,
    isLoadingActivity,
    activity,
    formData,
    isMobile,
    updateActivity,
    contentRef,
    collapsedLeft,
    stages,
  ]);

  return (
    <Modal
      open={isOpenModal}
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
              onSelectItem={item => {
                handleSelectItem(item);
              }}
              loading={isLoadingActivity}
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
