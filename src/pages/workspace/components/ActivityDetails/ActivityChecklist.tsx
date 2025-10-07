import { Checklist, IActivity } from '@/common/types';
import { useCreate, useList } from '@refinedev/core';
import { IconPlus } from '@tabler/icons-react';
import { Button, Progress, Space, Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import ActivityChecklistItem from './ActivityChecklistItem';

interface ActivityChecklistProps {
  activity: IActivity;
}

const ActivityChecklist = ({ activity }: ActivityChecklistProps) => {
  const [hoveredHeader, setHoveredHeader] = useState(false);
  const [localChecklists, setLocalChecklists] = useState<Checklist[]>([]);

  const { data: checklistData, isLoading: isLoadingChecklist } = useList<Checklist>({
    resource: `activities/${activity.id}/checklists`,
    queryOptions: {
      enabled: !!activity.id,
      retry: false,
    },
    pagination: {
      mode: 'off',
    },
  });

  const { mutate: createChecklist, isPending: isCreatingChecklist } = useCreate<Checklist>({
    resource: `activities/${activity.id}/checklists`,
    mutationOptions: {
      retry: false,
    },
  });

  useMemo(() => {
    if (isLoadingChecklist || !checklistData) return [];

    setLocalChecklists(checklistData?.data || []);
  }, [checklistData, isLoadingChecklist]);

  const { totalItems, completedItems, progress } = useMemo(() => {
    if (!localChecklists.length) {
      return { totalItems: 0, completedItems: 0, progress: 0 };
    }

    const total = localChecklists.reduce((acc, checklist) => acc + checklist.items.length, 0);
    const completed = localChecklists.reduce(
      (acc, checklist) => acc + checklist.items.filter(item => item.isDone).length,
      0,
    );

    return {
      totalItems: total,
      completedItems: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [localChecklists]);

  const handleAddChecklist = useCallback(() => {
    if (isCreatingChecklist) return;

    const newChecklist: Checklist = {
      id: `temp-${Date.now()}`,
      name: 'Danh sách việc mới',
      items: [],
      completedItems: 0,
      totalItems: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalChecklists(prev => [newChecklist, ...prev]);
    createChecklist({
      values: {
        name: newChecklist.name,
      },
    });
  }, [setLocalChecklists]);

  const handleChecklistItemUpdate = useCallback(
    (updateChecklist: Checklist) => {
      setLocalChecklists(prev =>
        prev.map(checklist => (checklist.id === updateChecklist.id ? updateChecklist : checklist)),
      );
    },
    [setLocalChecklists],
  );

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={12}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={() => setHoveredHeader(true)}
        onMouseLeave={() => setHoveredHeader(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0, margin: 2 }}>
            Danh sách việc:
          </Typography.Text>
          {localChecklists.length > 0 && (
            <Progress
              percent={progress}
              size={'small'}
              strokeColor={'#6ad3bc'}
              format={() => (
                <span style={{ fontSize: 12, color: '#838383' }}>
                  {completedItems}/{totalItems}
                </span>
              )}
              strokeWidth={8}
              style={{
                borderRadius: 8,
                minWidth: 80,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                marginTop: 4,
              }}
            />
          )}
        </div>
        {hoveredHeader && (
          <Button
            type="text"
            onClick={handleAddChecklist}
            icon={<IconPlus size={14} color="#838383" />}
            style={{
              borderRadius: 8,
            }}
            loading={isCreatingChecklist}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          />
        )}
      </div>

      {isLoadingChecklist ? (
        <div>loading...</div>
      ) : (
        <>
          {!localChecklists.length ? (
            <Button
              type="text"
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                color: '#838383',
                fontWeight: 500,
                fontSize: 14,
                height: 42,
              }}
              size="large"
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              onClick={handleAddChecklist}
              icon={<IconPlus size={14} color="#838383" />}
            >
              Thêm danh sách việc
            </Button>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
              }}
            >
              {localChecklists.map(checklist => (
                <ActivityChecklistItem
                  key={checklist.id}
                  checklist={checklist}
                  activity={activity}
                  onChecklistUpdate={handleChecklistItemUpdate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Space>
  );
};

export default ActivityChecklist;
