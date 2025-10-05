import { ActivityType } from '@/common/enum/activity';
import { IActivity } from '@/common/types';
import {
  IconBox,
  IconCalendarStats,
  IconChalkboardTeacher,
  IconCircleDashed,
  IconCornerDownLeft,
  IconDots,
  IconFlag,
  IconLocation,
  IconPlus,
  IconProgress,
  IconSchool,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Button, Input, Popover, Progress, Space, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

interface ActivitySubtaskProps {
  activity: IActivity;
}

const ActivitySubtask = ({ activity }: ActivitySubtaskProps) => {
  const [value, setValue] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [formData, _setFormData] = useState<Partial<IActivity>>({});

  const { subTasks, doneCount, totalCount, percent } = useMemo(() => {
    const subTasks = activity.subActivities || [];
    const doneCount = subTasks.filter((t: IActivity) => t.stage.isCompleted).length;
    const totalCount = subTasks.length;
    const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    return { subTasks, doneCount, totalCount, percent };
  }, [activity]);

  const onCancel = () => {
    setIsAddingTask(false);
    setValue('');
  };

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
            Hoạt động phụ:
          </Typography.Text>

          {subTasks.length > 0 && (
            <Progress
              percent={percent}
              size={'small'}
              strokeColor={'#6ad3bc'}
              format={() => (
                <span style={{ fontSize: 12, color: '#838383' }}>
                  {doneCount}/{totalCount}
                </span>
              )}
              strokeWidth={8}
              style={{
                borderRadius: 8,
                minWidth: 80,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                marginTop: '4px',
              }}
            />
          )}
        </div>
      </div>

      {!subTasks.length && !isAddingTask ? (
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
          onClick={() => setIsAddingTask(true)}
          icon={<IconPlus size={14} color="#838383" />}
        >
          Thêm hoạt động phụ
        </Button>
      ) : (
        <div
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            padding: '8px 8px 8px 12px',
            color: '#838383',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space
            styles={{
              item: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <IconCircleDashed size={16} stroke={3} color="#838383" />

            <Input
              style={{
                width: 250,
              }}
              size="small"
              variant="borderless"
              placeholder="Nhập tên hoạt động phụ..."
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </Space>

          {/* Action */}
          <Space
            styles={{
              item: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            {/* type */}
            {isMobile ? (
              <Popover
                placement="topRight"
                trigger={['click']}
                styles={{
                  body: { padding: 0, width: 250 },
                }}
                arrow={false}
                content={
                  <Space
                    style={{
                      padding: 8,
                      width: '100%',
                    }}
                    styles={{
                      item: {
                        width: '100%',
                      },
                    }}
                  >
                    <Typography
                      style={{
                        padding: '3px 12px 0',
                        fontWeight: 600,
                      }}
                    >
                      Tùy chỉnh
                    </Typography>
                  </Space>
                }
              >
                <Button
                  type="text"
                  size="small"
                  style={{
                    gap: 4,
                    color: '#646464',
                    borderColor: '#f0f0f0',
                    fontWeight: 500,
                    padding: '0 6px',
                  }}
                  icon={<IconDots size={14} stroke={2.5} />}
                  onClick={() => setIsAddingTask(true)}
                />
              </Popover>
            ) : (
              <>
                <Tooltip title="Chọn hoạt động phụ" placement="top">
                  <Button
                    type="text"
                    size="small"
                    style={{
                      gap: 4,
                      color: '#646464',
                      borderColor: '#f0f0f0',
                      fontWeight: 500,
                      padding: '0 6px',
                    }}
                    icon={<IconBox size={14} stroke={2.5} />}
                  />
                </Tooltip>

                <Tooltip title="Chọn người thực hiện" placement="top">
                  <Button
                    type="text"
                    size="small"
                    style={{
                      gap: 4,
                      color: '#646464',
                      borderColor: '#f0f0f0',
                      fontWeight: 500,
                      padding: '0 6px',
                    }}
                    icon={<IconUsers size={14} stroke={2.5} />}
                  />
                </Tooltip>

                <Tooltip title="Thiết lập thời hạn" placement="top">
                  <Button
                    type="text"
                    size="small"
                    style={{
                      gap: 4,
                      color: '#646464',
                      borderColor: '#f0f0f0',
                      fontWeight: 500,
                      padding: '0 6px',
                    }}
                    icon={<IconCalendarStats size={14} stroke={2.5} />}
                  />
                </Tooltip>

                <Tooltip title="Độ ưu tiên" placement="top">
                  <Button
                    type="text"
                    size="small"
                    style={{
                      gap: 4,
                      color: '#646464',
                      borderColor: '#f0f0f0',
                      fontWeight: 500,
                      padding: '0 6px',
                    }}
                    icon={<IconFlag size={14} stroke={2.5} />}
                  />
                </Tooltip>
                {formData.type === ActivityType.EVENT && (
                  <>
                    <Tooltip title="Vị trí tổ chức" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
                        }}
                        icon={<IconLocation size={14} stroke={2.5} />}
                      />
                    </Tooltip>

                    <Tooltip title="Loại sự kiện" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
                        }}
                        icon={<IconProgress size={14} stroke={2.5} />}
                      />
                    </Tooltip>

                    <Tooltip title="Số lượng giảng viên ước tính" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
                        }}
                        icon={<IconChalkboardTeacher size={14} stroke={2.5} />}
                      />
                    </Tooltip>

                    <Tooltip title="Số lượng sinh viên ước tính" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
                        }}
                        icon={<IconSchool size={14} stroke={2.5} />}
                      />
                    </Tooltip>
                  </>
                )}
              </>
            )}

            <Tooltip title={isMobile ? 'Hủy' : ''} placement="top">
              <Button
                style={{
                  gap: 4,
                  color: '#646464',
                  borderColor: '#f0f0f0',
                  fontWeight: 500,
                  padding: '0 6px',
                }}
                type="text"
                size="small"
                onClick={onCancel}
              >
                {isMobile ? <IconX size={14} stroke={2.5} /> : 'Hủy'}
              </Button>
            </Tooltip>
            <Tooltip title={isMobile ? 'Lưu' : ''} placement="top">
              <Button
                style={{
                  gap: 4,
                  backgroundColor: '#1890ff',
                  color: '#fff',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40a9ff')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1890ff')}
                size="small"
                icon={<IconCornerDownLeft size={14} stroke={3} />}
                iconPosition="end"
                type="text"
              >
                {isMobile ? '' : 'Lưu'}
              </Button>
            </Tooltip>
          </Space>
        </div>
      )}
    </Space>
  );
};

export default ActivitySubtask;
