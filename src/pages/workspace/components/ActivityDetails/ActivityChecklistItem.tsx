import { Checklist, IActivity } from '@/common/types';
import { useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import { IconDots, IconPencil, IconPlus, IconSquareRoundedX } from '@tabler/icons-react';
import { Button, Input, Popover, Typography } from 'antd';
import { memo, useCallback, useState } from 'react';

interface ActivityChecklistItemProps {
  checklist: Checklist;
  activity: IActivity;
}

const ActivityChecklistItem = ({ checklist, activity }: ActivityChecklistItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Checklist>(checklist);

  const invalidate = useInvalidate();

  const { mutate: updateChecklist } = useUpdate<Checklist>({
    mutationOptions: {
      retry: false,
      onSuccess: () => {
        invalidate({
          resource: `activities/${activity.id}/checklists`,
          invalidates: ['list'],
        });
      },
    },
  });

  const { mutate: deleteChecklist, isPending: isDeletingChecklist } = useDelete<Checklist>({
    mutationOptions: {
      retry: false,
    },
  });

  const handleDeleteChecklist = useCallback(
    (checklist: Checklist) => {
      deleteChecklist({
        id: checklist.id,
        resource: `activities/${activity.id}/checklists`,
      });
    },
    [checklist.id],
  );

  const handleUpdateName = useCallback(() => {
    if (formData.name.trim() === '') {
      setFormData(checklist);
      return;
    }

    if (formData.name !== checklist.name) {
      setFormData({ ...formData, name: formData.name });

      updateChecklist({
        id: checklist.id,
        resource: `activities/${activity.id}/checklists`,
        values: { name: formData.name },
      });
    }

    setIsEditing(false);
  }, [updateChecklist]);

  return (
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
          height: 42,
          backgroundColor: '#00000006',
          padding: 8,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          {isEditing ? (
            <Input
              autoFocus
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onPressEnter={handleUpdateName}
              onBlur={handleUpdateName}
              style={{
                fontSize: 14,
                fontWeight: 500,
                flexShrink: 0,
                flex: 1,
                width: '100%',
                border: '1px solid #cecece',
                borderRadius: 6,
                height: 24,
                maxWidth: 150,
              }}
              styles={{
                input: {
                  maxWidth: 'unset',
                },
              }}
              variant="borderless"
              size="small"
            />
          ) : (
            <Typography.Text
              style={{
                fontSize: 14,
                fontWeight: 500,
                flexShrink: 0,
                maxWidth: 'fit-content',
                minWidth: 0,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0000000a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => setIsEditing(true)}
            >
              {formData.name}
            </Typography.Text>
          )}

          <span
            style={{
              fontSize: 12,
              color: '#838383',
              backgroundColor: '#0000000a',
              padding: '2px 6px',
              borderRadius: 7,
              flexShrink: 0,
            }}
          >
            {formData.completedItems}/{formData.totalItems}
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
                onClick={() => setIsEditing(true)}
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
                loading={isDeletingChecklist}
                onClick={() => handleDeleteChecklist(formData)}
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
  );
};

export default memo(ActivityChecklistItem);
