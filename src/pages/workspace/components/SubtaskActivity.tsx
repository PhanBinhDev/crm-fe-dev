import { IconCircleCheck, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import { Button, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface SubtaskActivityProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const SubtaskActivity = ({ value, onChange }: SubtaskActivityProps) => {
  const [subtasks, setSubtasks] = useState<string[]>(value && value.length ? value : ['']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(subtasks)) {
      setSubtasks(value && value.length ? value : ['']);
    }
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(subtasks);
    }
  }, [subtasks]);

  const handleAddSubtask = () => {
    if (subtasks[subtasks.length - 1].trim()) {
      setSubtasks([...subtasks, '']);
      setFocusedIndex(subtasks.length);
    }
  };

  const handleDeleteSubtask = (index: number) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks.length ? newSubtasks : ['']);
    setFocusedIndex(null);
  };

  const handleChangeSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && subtasks[index].trim()) {
      if (index === subtasks.length - 1) {
        handleAddSubtask();
      }
    }
  };

  const handleEditSubtask = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text style={{ color: '#838383', fontWeight: 500, fontSize: 14 }}>Công việc phụ</Text>
      <div
        style={{
          width: '100%',
          margin: '0 auto',
          border: '1px solid #f0f0f0',
          borderRadius: 6,
        }}
      >
        {subtasks.map((text, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px 8px 0',
              borderBottom: idx === subtasks.length - 1 ? 'none' : '1px solid #f0f0f0',
              position: 'relative',
            }}
          >
            <Input
              value={text}
              onChange={e => handleChangeSubtask(idx, e.target.value)}
              onKeyDown={e => handleKeyPress(e, idx)}
              placeholder="Nhập tên công việc phụ"
              prefix={<IconCircleCheck size={14} style={{ color: '#838383', flexShrink: 0 }} />}
              variant="borderless"
              style={{
                flex: 1,
                boxShadow: 'none',
                border: 'none',
                opacity: '1 !important',
                cursor: focusedIndex === idx ? 'text' : 'not-allowed',
                fontSize: 14,
              }}
              autoFocus={focusedIndex === idx}
              onFocus={() => setFocusedIndex(idx)}
              readOnly={focusedIndex !== idx && text.trim() !== ''}
              disabled={focusedIndex !== idx && text.trim() !== ''}
            />
            {text.trim() !== '' && focusedIndex !== idx && (
              <Button
                type="text"
                size="small"
                icon={<IconPencil size={14} style={{ color: '#838383' }} />}
                onClick={() => handleEditSubtask(idx)}
                style={{
                  padding: '4px',
                  height: 'auto',
                  minWidth: 'auto',
                  borderRadius: 8,
                }}
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<IconX size={14} style={{ color: '#838383' }} />}
              onClick={() => handleDeleteSubtask(idx)}
              style={{
                padding: '4px',
                height: 'auto',
                minWidth: 'auto',
                borderRadius: 8,
              }}
            />
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderTop: '1px solid #f0f0f0',
            cursor: subtasks[subtasks.length - 1].trim() ? 'pointer' : 'not-allowed',
            color: '#838383',
            fontSize: 14,
            opacity: subtasks[subtasks.length - 1].trim() ? 1 : 0.8,
          }}
          onClick={handleAddSubtask}
        >
          <IconPlus size={14} style={{ color: '#838383', flexShrink: 0 }} />
          Thêm công việc phụ
        </div>
      </div>
    </Space>
  );
};

export default SubtaskActivity;
