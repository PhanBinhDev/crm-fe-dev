import { ChecklistItem, IActivity } from '@/common/types';
import {
  IconDots,
  IconPencil,
  IconSquareRoundedCheck,
  IconSquareRoundedCheckFilled,
  IconSquareRoundedX,
} from '@tabler/icons-react';
import { Button, Checkbox, Input, Popover, Space, Typography } from 'antd';
import { useState } from 'react';

interface ActivityChecklistItemInnerProps {
  item: ChecklistItem;
  isDeletingChecklist: boolean;
  activity: IActivity;
  handleToggleChecked: (item: ChecklistItem, isDone: boolean) => void;
  handleDeleteChecklistItem: (item: ChecklistItem) => void;
  handleChangeName: (item: ChecklistItem, newName: string) => void;
}
const ActivityChecklistItemInner = ({
  item,
  isDeletingChecklist,
  handleToggleChecked,
  handleDeleteChecklistItem,
  handleChangeName,
}: ActivityChecklistItemInnerProps) => {
  const [popen, setPopen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.content);

  const onChangeName = () => {
    if (newName.trim() === item.content) {
      setIsEditing(false);
      return;
    }

    handleChangeName(item, newName);
    setIsEditing(false);
  };

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
          onChange={checked => handleToggleChecked(item, checked.target.checked)}
        />
        {isEditing ? (
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            onBlur={onChangeName}
            onPressEnter={onChangeName}
            variant="borderless"
            size="small"
            style={{
              paddingLeft: 0,
            }}
          />
        ) : (
          <Typography.Text onClick={() => setIsEditing(true)}>{item.content}</Typography.Text>
        )}
      </Space>
      <Popover
        placement="leftBottom"
        trigger={['click']}
        styles={{
          body: { padding: 8 },
        }}
        arrow={false}
        open={popen}
        onOpenChange={setPopen}
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
              onClick={() => {
                setIsEditing(true);
                setPopen(false);
              }}
            >
              Đổi tên mục
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
              onClick={() => {
                handleToggleChecked(item, !item.isDone);
                setPopen(false);
              }}
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
