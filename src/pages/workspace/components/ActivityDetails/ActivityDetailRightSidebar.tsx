import { IconLink, IconMessage } from '@tabler/icons-react';
import { Button, Divider, Layout, Tooltip } from 'antd';
import { useState } from 'react';
import ActivityLinkTab from './ActivityLinkTab';
import ActivityLogTab from './ActivityLogTab';

const { Sider } = Layout;

type RightSidebarTab = 'links' | 'logs';

const ActivityDetailRightSidebar = () => {
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [activeTab, setActiveTab] = useState<RightSidebarTab>('logs');

  const handleTabClick = (tab: RightSidebarTab) => {
    if (activeTab === tab) {
      setCollapsedRight(!collapsedRight);
      return;
    }
    setActiveTab(tab);
    if (collapsedRight) {
      setCollapsedRight(false);
    }
  };

  return (
    <>
      <Sider
        collapsed={collapsedRight}
        collapsible
        trigger={null}
        width={360}
        collapsedWidth={0}
        style={{
          background: '#fff',
          borderLeft: '1px solid #f0f0f0',
          overflow: 'hidden',
          position: 'relative',
          transition: 'width 0.2s ease',
        }}
      >
        {!collapsedRight && activeTab === 'logs' && <ActivityLogTab />}
        {!collapsedRight && activeTab === 'links' && <ActivityLinkTab />}
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
      </div>
    </>
  );
};

export default ActivityDetailRightSidebar;
