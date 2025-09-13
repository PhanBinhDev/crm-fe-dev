import { Checklist } from '@/common/types';
import { useChecklistState } from '@/hooks/useChecklistState';
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Button, Checkbox, Dropdown, Input } from 'antd';
interface ChecklistItemProps {
  item: { content: string; isDone: boolean };
  checklistIndex: number;
  itemIndex: number;
  onUpdate: (updates: Partial<{ content: string; isDone: boolean }>) => void;
  onRemove: () => void;
  onEnter: () => void;
  onBlur: () => void;
}

const ChecklistItem = ({
  item,
  checklistIndex,
  itemIndex,
  onUpdate,
  onRemove,
  onEnter,
  onBlur,
}: ChecklistItemProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        padding: '4px 0',
      }}
    >
      <Checkbox
        checked={item.isDone}
        disabled={!item.content}
        onChange={e => onUpdate({ isDone: e.target.checked })}
      />

      <Input
        value={item.content}
        onChange={e => onUpdate({ content: e.target.value })}
        placeholder="Nhập nhiệm vụ..."
        variant="borderless"
        size="small"
        style={{ fontSize: '13px', flex: 1 }}
        data-checklist={checklistIndex}
        data-item={itemIndex}
        onPressEnter={onEnter}
        onBlur={onBlur}
      />

      <Button
        type="text"
        size="small"
        disabled={!item.content}
        icon={<IconX size={12} color="#838383" />}
        onClick={onRemove}
      />
    </div>
  );
};

interface ChecklistHeaderProps {
  checklist: Checklist;
  checklistIndex: number;
  isCollapsed: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleCollapse: () => void;
  onUpdateName: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const ChecklistHeader = ({
  checklist,
  checklistIndex,
  isCollapsed,
  canMoveUp,
  canMoveDown,
  onToggleCollapse,
  onUpdateName,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ChecklistHeaderProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid #f1f5f9',
        background: '#f8f9fa',
        borderRadius: '6px 6px 0 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <Button
          type="text"
          size="small"
          icon={
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
              }}
            >
              <IconChevronRight size={12} color="#838383" />
            </span>
          }
          onClick={onToggleCollapse}
          style={{
            width: '20px',
            height: '20px',
            minWidth: '20px',
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
        />
        <Input
          value={checklist.name}
          onChange={e => onUpdateName(e.target.value)}
          placeholder="Nhập tên danh sách..."
          variant="borderless"
          size="small"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            flex: 1,
          }}
          data-checklist-title={checklistIndex}
        />
      </div>

      <Dropdown
        menu={{
          items: [
            {
              key: 'rename',
              label: 'Đổi tên',
              icon: <IconEdit size={14} />,
              onClick: () => {
                const titleInput = document.querySelector(
                  `[data-checklist-title="${checklistIndex}"]`,
                ) as HTMLInputElement;
                if (titleInput) titleInput.focus();
              },
            },
            {
              key: 'moveup',
              label: 'Di chuyển lên',
              icon: <IconArrowUp size={14} />,
              disabled: !canMoveUp,
              onClick: onMoveUp,
            },
            {
              key: 'movedown',
              label: 'Di chuyển xuống',
              icon: <IconArrowDown size={14} />,
              disabled: !canMoveDown,
              onClick: onMoveDown,
            },
            {
              type: 'divider',
            },
            {
              key: 'delete',
              label: 'Xóa checklist',
              icon: <IconTrash size={14} />,
              danger: true,
              onClick: onRemove,
            },
          ],
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<IconDots size={12} color="#838383" />}
          style={{
            width: '24px',
            height: '24px',
            minWidth: '24px',
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
        />
      </Dropdown>
    </div>
  );
};

interface ChecklistCardProps {
  checklist: Checklist;
  index: number;
  isCollapsed: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleCollapse: () => void;
  onUpdateName: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemIndex: number, updates: Partial<{ content: string; isDone: boolean }>) => void;
  onRemoveItem: (itemIndex: number) => void;
}

const ChecklistCard = ({
  checklist,
  index,
  isCollapsed,
  canMoveUp,
  canMoveDown,
  onToggleCollapse,
  onUpdateName,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ChecklistCardProps) => {
  const handleItemEnter = (_itemIndex: number, content: string) => {
    if (content.trim()) {
      const hasEmptyItem = checklist.items.some(item => !item.content?.trim());
      if (!hasEmptyItem) {
        onAddItem();
        setTimeout(() => {
          const newItemInput = document.querySelector(
            `[data-checklist="${index}"][data-item="${checklist.items.length}"]`,
          ) as HTMLInputElement;
          if (newItemInput) newItemInput.focus();
        }, 50);
      }
    }
  };

  const handleItemBlur = (itemIndex: number, content: string) => {
    if (!content.trim() && checklist.items.length > 1) {
      onRemoveItem(itemIndex);
    }
  };

  return (
    <div
      style={{
        marginBottom: 12,
        border: '1px solid #f1f1f0',
        borderRadius: 6,
        background: '#ffffff',
      }}
    >
      <ChecklistHeader
        checklist={checklist}
        checklistIndex={index}
        isCollapsed={isCollapsed}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onToggleCollapse={onToggleCollapse}
        onUpdateName={onUpdateName}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />

      {!isCollapsed && (
        <div style={{ padding: '8px 12px' }}>
          {checklist.items?.map((item, itemIndex) => (
            <ChecklistItem
              key={itemIndex}
              item={item}
              checklistIndex={index}
              itemIndex={itemIndex}
              onUpdate={updates => onUpdateItem(itemIndex, updates)}
              onRemove={() => onRemoveItem(itemIndex)}
              onEnter={() => handleItemEnter(itemIndex, item.content)}
              onBlur={() => handleItemBlur(itemIndex, item.content)}
            />
          ))}

          <Button
            type="text"
            size="small"
            onClick={onAddItem}
            style={{
              color: '#838383',
              fontSize: '12px',
              height: '28px',
              padding: '0 8px',
              marginTop: 4,
            }}
            icon={<IconPlus size={12} color="#8c8c8c" />}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
          >
            Thêm nhiệm vụ
          </Button>
        </div>
      )}
    </div>
  );
};

interface ChecklistActivityProps {
  value: Checklist[];
  onChange?: (value: Checklist[]) => void;
}

const ChecklistActivity = ({ value = [], onChange }: ChecklistActivityProps) => {
  const {
    collapsedStates,
    addChecklist,
    removeChecklist,
    updateChecklistName,
    moveChecklist,
    toggleCollapse,
    addItem,
    removeItem,
    updateItem,
  } = useChecklistState(value, onChange);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: value.length > 0 ? 12 : 8,
        }}
      >
        <div
          style={{
            color: '#838383',
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          Danh sách việc
          {value.length > 0 && (
            <span
              style={{
                background: '#f4f6fa',
                color: '#23272f',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                minWidth: '22px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(60,60,60,0.06)',
                letterSpacing: '0.5px',
                display: 'inline-block',
              }}
            >
              {value.length}
            </span>
          )}
        </div>
        <Button
          type="text"
          size="small"
          onClick={addChecklist}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#838383',
            height: '24px',
            padding: '2px 4px',
            gap: 4,
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          icon={<IconPlus size={12} color="#838383" />}
        >
          Tạo danh sách
        </Button>
      </div>

      {/* Checklist Cards */}
      {value.map((checklist, index) => (
        <ChecklistCard
          key={index}
          checklist={checklist}
          index={index}
          isCollapsed={collapsedStates[index]}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          onToggleCollapse={() => toggleCollapse(index)}
          onUpdateName={name => updateChecklistName(index, name)}
          onMoveUp={() => moveChecklist(index, index - 1)}
          onMoveDown={() => moveChecklist(index, index + 1)}
          onRemove={() => removeChecklist(index)}
          onAddItem={() => addItem(index)}
          onUpdateItem={(itemIndex, updates) => updateItem(index, itemIndex, updates)}
          onRemoveItem={itemIndex => removeItem(index, itemIndex)}
        />
      ))}

      {/* Empty State */}
      {value.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            color: '#838383',
            fontSize: '14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        >
          <div>Chưa có danh sách việc nào</div>
        </div>
      )}
    </div>
  );
};

export default ChecklistActivity;
