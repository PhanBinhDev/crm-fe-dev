import { IconEdit } from '@tabler/icons-react';
import { Button, Typography } from 'antd';
import { useState } from 'react';

export const EditableField = ({
  value,
  icon,
  label,
  type = 'text',
  onSave,
  renderValue,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  type?: 'text' | 'date';
  onSave: (val: string) => void;
  renderValue?: (val: string) => React.ReactNode;
}) => {
  const [editing, setEditing] = useState(false);
  const [hover, setHover] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        minHeight: 48,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 13, display: 'block', marginBottom: 2, lineHeight: 1.2 }}
        >
          {label}
        </Typography.Text>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
          {editing ? (
            type === 'date' ? (
              <input
                type="date"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1F2937',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                  padding: '2px 8px',
                  height: 28,
                  lineHeight: '28px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4096ff')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            ) : (
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1F2937',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                  padding: '2px 8px',
                  height: 28,
                  lineHeight: '28px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4096ff')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            )
          ) : (
            <Typography.Text
              style={{ fontSize: 15, fontWeight: 500, color: '#1F2937', lineHeight: '28px' }}
            >
              {renderValue ? renderValue(value) : value || '-'}
            </Typography.Text>
          )}
        </div>
      </div>
      {(hover || editing) && (
        <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          {editing ? (
            <>
              <Button
                type="link"
                size="small"
                style={{ padding: '0 4px', height: 24, fontSize: 13 }}
                onClick={() => {
                  onSave(inputValue);
                  setEditing(false);
                }}
              >
                Lưu
              </Button>
              <Button
                type="link"
                size="small"
                style={{ padding: '0 4px', height: 24, fontSize: 13 }}
                onClick={() => setEditing(false)}
              >
                Hủy
              </Button>
            </>
          ) : (
            <Button
              type="text"
              icon={<IconEdit size={16} />}
              size="small"
              style={{ padding: 0, height: 24 }}
              onClick={() => setEditing(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};
