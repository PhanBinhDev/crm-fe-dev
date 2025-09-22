import { IActivity, IStage } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import ActivityDetailRightSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailRightSidebar';
import ActivityDetailSidebar from '@/pages/workspace/components/ActivityDetails/ActivityDetailSidebar';
import {
  IconCalendar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftCollapseFilled,
  IconShare,
  IconX,
} from '@tabler/icons-react';
import { Button, Layout, Modal, Space, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const ModalEditActivity = () => {
  const { isOpen, type, closeModal, data } = useModal();
  const isOpenModal = isOpen && type === 'ModalEditActivity';
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isOverlay, setIsOverlay] = useState(false);

  const { activity } = (data as { activity: IActivity }) || {};
  const { stage } = (data as { stage: IStage }) || {};
  console.log('stage in modal', stage);

  useEffect(() => {
    const checkWidth = () => {
      if (layoutRef.current) {
        const width = layoutRef.current.offsetWidth;
        setIsOverlay(width < 768);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);

    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <Modal
      open={isOpenModal}
      onCancel={closeModal}
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
          height: '80vh',
          maxHeight: '80vh',
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
            height: '100%',
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
              background: '#fff',
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
                    boxShadow: collapsedLeft ? 'none' : '4px 0 8px rgba(0,0,0,0.06)',
                  }
                : {
                    position: 'relative',
                    transition: 'width 0.2s ease',
                  }),
            }}
          >
            <ActivityDetailSidebar activity={activity} stage={stage} />
          </Sider>

          {/* Main Content */}
          <Content
            style={{
              textAlign: 'center',
              minHeight: 120,
              lineHeight: '120px',
              color: '#000',
              background: '#fafafa',
              overflow: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              marginLeft: 0,
              transition: 'margin 0.2s ease',
            }}
            className="hide-scrollbar"
          >
            <div style={{ padding: 20, height: '100%' }}>Content</div>
          </Content>

          <ActivityDetailRightSidebar />
        </Layout>
      </Layout>
    </Modal>
  );
};

export default ModalEditActivity;
