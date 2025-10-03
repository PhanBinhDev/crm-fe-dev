import { IconFilePencil, IconLink, IconMessage, IconMessageCircle, IconPaperclip } from '@tabler/icons-react';
import { Button, Divider, Layout, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import ActivityCommentTab from './ActivityCommentTab';
import ActivityFeedbackTab from './ActivityFeedbackTab';
import ActivityFilesTab from './ActivityFilesTab';
import ActivityLinkTab from './ActivityLinkTab';
import ActivityLogTab from './ActivityLogTab';

const { Sider } = Layout;

type RightSidebarTab = 'links' | 'logs' | 'feedback' | 'comment' | 'files';

interface ActivityDetailRightSidebarProps {
  isOverlay: boolean;
  collapsedLeft: boolean;
  setCollapsedLeft: (val: boolean) => void;
  activityId: string;
}

const ActivityDetailRightSidebar = ({
  isOverlay,
  collapsedLeft,
  setCollapsedLeft,
  activityId,
}: ActivityDetailRightSidebarProps) => {
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [activeTab, setActiveTab] = useState<RightSidebarTab>('logs');

  const handleTabClick = (tab: RightSidebarTab) => {
    if (activeTab === tab) {
      setCollapsedRight(!collapsedRight);
      if (isOverlay && collapsedRight) setCollapsedLeft(true);
      return;
    }
    setActiveTab(tab);
    if (collapsedRight) setCollapsedRight(false);
    if (isOverlay) setCollapsedLeft(true);
  };

  useEffect(() => {
    if (isOverlay && !collapsedLeft) {
      setCollapsedRight(true);
    }
  }, [collapsedLeft, isOverlay]);

  return (
    <>
      <Sider
        collapsed={collapsedRight}
        collapsible
        trigger={null}
        width={350}
        collapsedWidth={0}
        style={{
          background: '#fff',
          borderLeft: '1px solid #f0f0f0',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          ...(isOverlay
            ? {
                position: 'absolute',
                right: 49,
                top: 0,
                bottom: 0,
                zIndex: 10,
                transform: collapsedRight ? 'translateX(-100%)' : 'translateX(0)',
                boxShadow: collapsedRight
                  ? 'none'
                  : '0 10px 15px -3px rgba(0, 0, 0, .106), 0 4px 6px -4px rgba(0, 0, 0, .106)',
              }
            : {
                position: 'relative',
                transition: 'width 0.2s ease',
              }),
        }}
      >
        {!collapsedRight && activeTab === 'logs' && <ActivityLogTab activityId={activityId} />}
        {!collapsedRight && activeTab === 'links' && <ActivityLinkTab activityId={activityId} />}
        {!collapsedRight && activeTab === 'files' && <ActivityFilesTab activityId={activityId} />}
        {!collapsedRight && activeTab === 'feedback' && (
          <ActivityFeedbackTab activityId={activityId} />
        )}
        {!collapsedRight && activeTab === 'comment' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 8px 8px 16px',
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Typography.Title level={4} style={{ margin: 0 }}>
                Bình luận
              </Typography.Title>
            </div>
            <ActivityCommentTab activityId={activityId} />
          </div>
        )}
      </Sider>
      <div
        style={{
          display: 'flex',
          padding: '12px 8px',
          background: '#fff',
          borderLeft: !collapsedRight ? '1px solid #f0f0f0' : 'none',
          flexDirection: 'column',
        }}
      >
        <>
          <Tooltip placement="left" title={'Nhật ký hoạt động'}>
            <Button
              type="text"
              icon={<IconMessage size={16} stroke={1.5} color="#838383" />}
              style={{
                background: activeTab === 'logs' ? '#f0f0f0' : 'transparent',
                borderRadius: 8,
              }}
              styles={{
                icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
              }}
              onClick={() => handleTabClick('logs')}
            />
          </Tooltip>
        </>

        <Divider
          style={{
            margin: '12px 0',
          }}
        />

        <Tooltip placement="left" title={'Liên kết'}>
          <Button
            type="text"
            icon={<IconLink size={16} stroke={1.5} color="#838383" />}
            style={{
              background: activeTab === 'links' ? '#f0f0f0' : 'transparent',
              borderRadius: 8,
            }}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => handleTabClick('links')}
          />
        </Tooltip>

        <Divider
          style={{
            margin: '12px 0',
          }}
        />

        <Tooltip placement="left" title={'Tệp đính kèm'}>
          <Button
            type="text"
            icon={<IconPaperclip size={16} stroke={1.5} color="#838383" />}
            style={{
              background: activeTab === 'files' ? '#f0f0f0' : 'transparent',
              borderRadius: 8,
            }}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => handleTabClick('files')}
          />
        </Tooltip>

        <Divider
          style={{
            margin: '12px 0',
          }}
        />

        <Tooltip placement="left" title={'Bình luận'}>
          <Button
            type="text"
            icon={<IconMessageCircle size={16} stroke={1.5} color="#838383" />}
            style={{
              background: activeTab === 'comment' ? '#f0f0f0' : 'transparent',
              borderRadius: 8,
            }}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => handleTabClick('comment')}
          />
        </Tooltip>

        <Divider
          style={{
            margin: '12px 0',
          }}
        />

        <Tooltip placement="left" title={'Đánh giá'}>
          <Button
            type="text"
            icon={<IconFilePencil size={16} stroke={1.5} color="#838383" />}
            style={{
              background: activeTab === 'feedback' ? '#f0f0f0' : 'transparent',
              borderRadius: 8,
            }}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => handleTabClick('feedback')}
          />
        </Tooltip>
      </div>
    </>
  );
};

export default ActivityDetailRightSidebar;
