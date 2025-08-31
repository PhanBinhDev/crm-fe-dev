import { IActivity, IStage } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import FilterActivities from '@/pages/workspace/components/FilterActivities';
import SearchActivities from '@/pages/workspace/components/SearchActivities';
import SettingsActivities from '@/pages/workspace/components/SettingsActivities';
import KanbanView from '@/pages/workspace/views/KanbanView';
import ListView from '@/pages/workspace/views/ListView';
import { useList } from '@refinedev/core';
import { IconCalendar, IconLayoutKanban, IconList, IconPlus } from '@tabler/icons-react';
import { Button, Space, Tabs, Tooltip } from 'antd';
import { useCallback, useState } from 'react';
import CalendarView from '../views/CalendarView';

type TabKey = 'kanban' | 'list' | 'calendar';

const KanbanWorkspaces = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('kanban');

  const { openModal } = useModal();

  const onSearch = useCallback((value: string) => {
    console.log('run with value', value);
  }, []);

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
          alignItems: 'center',
          width: '100%',
          marginBottom: 12,
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
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'kanban' ? 600 : 400,
                    color: activeTab === 'kanban' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconLayoutKanban
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'kanban' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Bảng
                </span>
              ),
            },
            {
              key: 'list',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'list' ? 600 : 400,
                    color: activeTab === 'list' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconList
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'list' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Danh sách
                </span>
              ),
            },
            {
              key: 'calendar',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'calendar' ? 600 : 400,
                    color: activeTab === 'calendar' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconCalendar
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'calendar' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Lịch
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
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            padding: '0 12px',
            gap: 8,
          }}
          style={{
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
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
              onClick={() => openModal('ModalAddActivity')}
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
      {activeTab === 'calendar' && <CalendarView />}
    </div>
  );
};

export default KanbanWorkspaces;
