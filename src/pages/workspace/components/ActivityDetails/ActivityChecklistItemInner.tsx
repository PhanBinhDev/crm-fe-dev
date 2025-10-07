import { Checklist, ChecklistItem, IActivity } from '@/common/types';
import { useCreate, useInvalidate } from '@refinedev/core';
import {
  IconDots,
  IconPencil,
  IconSquareRoundedCheck,
  IconSquareRoundedCheckFilled,
  IconSquareRoundedX,
} from '@tabler/icons-react';
import { Button, Checkbox, Popover, Space } from 'antd';
import { useCallback, useState } from 'react';

interface ActivityChecklistItemInnerProps {
  item: ChecklistItem;
  isDeletingChecklist: boolean;
  activity: IActivity;
  handlehandleToggleChecked: (item: ChecklistItem, isDone: boolean) => void;
  handleDeleteChecklistItem: (item: ChecklistItem) => void;
}
const ActivityChecklistItemInner = ({
  item,
  isDeletingChecklist,
  activity,
  handlehandleToggleChecked,
  handleDeleteChecklistItem,
}: ActivityChecklistItemInnerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div
      key={item.id}
      style={{
        width: '100%',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px 0 12px',
      }}
    >
      <Space size={8}>
        <Checkbox
          checked={item.isDone}
          onChange={checked => handlehandleToggleChecked(item, checked.target.checked)}
        />
        {item.content}
      </Space>
      <Popover
        placement="leftBottom"
        trigger={['click']}
        styles={{
          body: { padding: 8 },
        }}
        arrow={false}
        content={
          <div style={{ width: 180 }}>
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
              icon={
                !item.isDone ? (
                  <IconSquareRoundedCheck size={16} />
                ) : (
                  <IconSquareRoundedCheckFilled size={16} />
                )
              }
              style={{
                width: '100%',
                textAlign: 'left',
                justifyContent: 'flex-start',
                color: item.isDone ? '#38a403' : '#646464',
                padding: '0 8px',
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              onClick={() => handlehandleToggleChecked(item, !item.isDone)}
            >
              {item.isDone ? 'Bỏ tích' : 'Tích hoàn thành'}
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
              onClick={() => handleDeleteChecklistItem(item)}
            >
              Xóa mục
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
  );
};

export default ActivityChecklistItemInner;
