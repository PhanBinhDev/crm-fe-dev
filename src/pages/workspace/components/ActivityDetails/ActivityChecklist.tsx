import { Checklist, IActivity } from '@/common/types';
import { useList } from '@refinedev/core';
import { IconDots, IconPencil, IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import { Button, Popover, Progress, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import ActivityChecklistItem from './ActivityChecklistItem';

interface ActivityChecklistProps {
  activity: IActivity;
}

const ActivityChecklist = ({ activity }: ActivityChecklistProps) => {
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [hoveredHeader, setHoveredHeader] = useState(false);

  const { data: checklistData, isLoading: isLoadingChecklist } = useList<Checklist>({
    resource: `activities/${activity.id}/checklists`,
    queryOptions: {
      enabled: !!activity.id,
      retry: false,
    },
  });

  const checklists = useMemo(() => {
    if (isLoadingChecklist || !checklistData) return [];

    return checklistData?.data || [];
  }, [checklistData]);

  const { totalItems, completedItems, progress } = useMemo(() => {
    if (!checklists.length) {
      return { totalItems: 0, completedItems: 0, progress: 0 };
    }

    const total = checklists.reduce((acc, checklist) => acc + checklist.items.length, 0);
    const completed = checklists.reduce(
      (acc, checklist) => acc + checklist.items.filter(item => item.isDone).length,
      0,
    );

    return {
      totalItems: total,
      completedItems: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [checklists]);

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={() => setHoveredHeader(true)}
        onMouseLeave={() => setHoveredHeader(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0, margin: 2 }}>
            Danh sách việc:
          </Typography.Text>
          {checklists.length > 0 && (
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
            onClick={() => setIsAddingChecklist(true)}
            icon={<IconPlus size={14} color="#838383" />}
          />
        )}
      </div>

      {isLoadingChecklist ? (
        <div>loading...</div>
      ) : (
        <>
          {!checklists.length && !isAddingChecklist ? (
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
              onClick={() => setIsAddingChecklist(true)}
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
              {isAddingChecklist && (
                <div
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    color: '#838383',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      minHeight: 40,
                      backgroundColor: '#00000006',
                      padding: '8px 8px 8px 12px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Typography.Text style={{ fontSize: 15, fontWeight: 500, flexShrink: 0 }}>
                        Danh sách việc mới
                      </Typography.Text>

                      <span
                        style={{
                          fontSize: 12,
                          color: '#838383',
                          backgroundColor: '#0000000a',
                          padding: '2px 6px',
                          borderRadius: 7,
                        }}
                      >
                        0/0
                      </span>
                    </div>
                    <Popover
                      placement="leftBottom"
                      trigger={['click']}
                      styles={{
                        body: { padding: 8 },
                      }}
                      arrow={false}
                      content={
                        <div style={{ width: 160 }}>
                          <Button
                            type="text"
                            icon={<IconPlus size={16} />}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              color: '#646464',
                              padding: '0 8px',
                            }}
                            styles={{
                              icon: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                            }}
                          >
                            Thêm mục việc
                          </Button>
                          <Button
                            type="text"
                            icon={<IconPencil size={16} />}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              color: '#646464',
                              padding: '0 8px',
                            }}
                            styles={{
                              icon: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                            }}
                          >
                            Đổi tên danh sách
                          </Button>

                          <Button
                            type="text"
                            icon={<IconSquareRoundedX size={16} />}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              color: '#ff4d4f',
                              padding: '0 8px',
                            }}
                            styles={{
                              icon: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                            }}
                          >
                            Xóa danh sách
                          </Button>
                        </div>
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#cecece',
                          fontWeight: 500,
                          padding: '0 6px',
                          borderRadius: 7,
                        }}
                        styles={{
                          icon: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        }}
                        icon={<IconDots size={14} stroke={2.5} />}
                      />
                    </Popover>
                  </div>
                </div>
              )}

              {checklists.map(checklist => (
                <ActivityChecklistItem key={checklist.id} checklist={checklist} />
              ))}
            </div>
          )}
        </>
      )}
    </Space>
  );
};

export default ActivityChecklist;
