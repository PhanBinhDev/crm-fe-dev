import { useState } from 'react';
import { Button, Space, Tabs, Tooltip } from 'antd';
import { IconLayoutKanban, IconList, IconPlus } from '@tabler/icons-react';
import SearchActivities from '@/pages/workspace/components/SearchActivities';
import FilterActivities from '@/pages/workspace/components/FilterActivities';
import SettingsActivities from '@/pages/workspace/components/SettingsActivities';
import KanbanView from '@/pages/workspace/views/KanbanView';
import ListView from '@/pages/workspace/views/ListView';
import { useList } from '@refinedev/core';
import { IActivity, IStage } from '@/common/types';

type TabKey = 'kanban' | 'list';

const KanbanWorkspaces = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('kanban');

  const onSearch = (value: string) => {
    console.log('run with value', value);
  };

  // query

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const { data: activitiesData } = useList<IActivity>({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: [
      /* filter từ search/filter ở cha */
    ],
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Headers */}
      <Space
        style={{
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Change layout */}
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as TabKey)}
          items={[
            {
              key: 'kanban',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconLayoutKanban size={16} style={{ marginRight: 2 }} />
                  Board
                </span>
              ),
            },
            {
              key: 'list',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconList size={16} style={{ marginRight: 2 }} />
                  List
                </span>
              ),
            },
          ]}
          tabBarStyle={{
            borderBottom: 'none',
            marginBottom: 0,
            height: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
          }}
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '0 14px',
            height: 36,
            display: 'flex',
            alignItems: 'center',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: 12,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <SearchActivities onSearch={onSearch} />
          <FilterActivities />
          <SettingsActivities />
          <Tooltip title="Thêm mới hoạt động">
            <Button
              type="primary"
              icon={<IconPlus size={16} />}
              style={{
                borderRadius: 8,
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
            />
          </Tooltip>
        </div>
      </Space>

      {activeTab === 'kanban' && (
        <KanbanView stages={stagesData?.data || []} activities={activitiesData?.data || []} />
      )}
      {activeTab === 'list' && <ListView />}
    </div>
  );
};

export default KanbanWorkspaces;
