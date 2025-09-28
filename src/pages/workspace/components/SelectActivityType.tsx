import { ActivityType } from '@/common/enum/activity';
import { IActivity } from '@/common/types';
import { getActivityTypeLabel } from '@/utils';
import { useUpdate } from '@refinedev/core';
import { IconCalendarTime, IconCheck, IconCircleDashed } from '@tabler/icons-react';
import { Button, message, Popover, Skeleton, Space, Tooltip, Typography } from 'antd';
import { useState } from 'react';

interface SelectActivityTypeProps {
  activity?: IActivity | null;
  isLoading?: boolean;
  value?: ActivityType;
  onChange?: (type: ActivityType) => void;
}

export const SelectActivityTypeSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
    <Skeleton.Button
      active
      size="small"
      style={{
        height: 27,
        width: 80,
        borderRadius: 6,
        marginRight: 2,
        borderEndEndRadius: 0,
        borderStartEndRadius: 0,
      }}
    />
    <Skeleton.Button
      active
      size="small"
      style={{
        height: 27,
        width: 80,
        borderRadius: 6,
        borderEndStartRadius: 0,
        borderStartStartRadius: 0,
      }}
    />
  </div>
);

const SelectActivityType = ({ activity, isLoading, onChange, value }: SelectActivityTypeProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>(
    activity?.type || value || ActivityType.TASK,
  );

  const handleCopy = (text: string) => {
    if (copied) return;

    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('Đã sao chép ID hoạt động!');
    setTimeout(() => setCopied(false), 2000);
  };

  const { mutate, isPending } = useUpdate<IActivity>({
    resource: 'activities',
    id: activity?.id,
  });

  const onActivityTypeClick = (type: ActivityType) => {
    setSelectedType(type);

    if (!activity) {
      if (onChange) onChange(type);
      return;
    }

    if (activity?.type === type) {
      setOpen(false);
      return;
    }

    mutate(
      {
        values: {
          type,
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật loại hoạt động thành công!');
          setOpen(false);
        },
        onError: () => {
          message.error('Cập nhật loại hoạt động thất bại!');
        },
      },
    );
  };

  const contentType = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
        gap: 0,
      }}
    >
      <Typography
        style={{
          padding: '3px 12px 0',
          fontWeight: 600,
        }}
      >
        Loại hoạt động
      </Typography>

      <Space
        direction="vertical"
        style={{
          gap: 4,
          width: '100%',
          padding: 8,
        }}
        styles={{
          item: {
            width: '100%',
          },
        }}
      >
        <Button
          type="text"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '0 6px',
          }}
          onClick={() => {
            onActivityTypeClick(ActivityType.TASK);
            setOpen(false);
          }}
          loading={isPending && selectedType === ActivityType.TASK}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {<IconCircleDashed size={14} />}
            Công việc
          </div>

          {!isPending && selectedType === ActivityType.TASK && (
            <IconCheck size={14} color="#838383" style={{ marginLeft: 'auto', display: 'block' }} />
          )}
        </Button>

        <Button
          type="text"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '0 6px',
          }}
          onClick={() => {
            onActivityTypeClick(ActivityType.EVENT);
            setOpen(false);
          }}
          loading={isPending && selectedType === ActivityType.EVENT}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCalendarTime size={14} />
            Sự kiện
          </div>

          {!isPending && selectedType === ActivityType.EVENT && (
            <IconCheck size={14} color="#838383" style={{ marginLeft: 'auto', display: 'block' }} />
          )}
        </Button>
      </Space>
    </Space>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <Popover
        placement="bottomLeft"
        trigger={['click']}
        styles={{
          body: {
            padding: '8px 0 0',
            width: 200,
          },
        }}
        open={open}
        onOpenChange={setOpen}
        arrow={false}
        content={contentType}
      >
        <Button
          style={{
            height: 27,
            borderRadius: 6,
            width: 'fit-content',
            border: '1px solid #f0f0f0',
            color: '#646464',
            fontSize: 14,
            fontWeight: 500,
            gap: 4,
            ...(activity ? { borderEndEndRadius: 0, borderStartEndRadius: 0 } : {}),
          }}
          type="text"
          size="small"
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={
            selectedType === ActivityType.EVENT ? (
              <IconCalendarTime size={14} />
            ) : (
              <IconCircleDashed size={14} />
            )
          }
        >
          {getActivityTypeLabel(selectedType || activity?.type || ActivityType.TASK)}
        </Button>
      </Popover>
      {activity && (
        <Tooltip title={!copied && 'Sao chép ID hoạt động'}>
          <Button
            style={{
              height: 27,
              borderRadius: 6,
              borderEndStartRadius: 0,
              borderStartStartRadius: 0,
              width: 'fit-content',
              border: '1px solid #f0f0f0',
              color: '#646464',
              fontWeight: 500,
              padding: '0 8px',
            }}
            type="text"
            size="small"
            loading={isLoading}
            onClick={() => activity?.id && handleCopy(activity.id)}
          >
            {copied ? (
              <IconCheck size={14} color="#52c41a" />
            ) : activity?.id ? (
              activity.id.slice(0, 8)
            ) : (
              ''
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default SelectActivityType;
