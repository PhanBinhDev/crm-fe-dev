import { Input, Tooltip } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';

interface InlineEditTextProps {
  value: string;
  onSave: (newValue: string) => void;
  minWidth?: number;
  placeholder?: string;
}

const InlineEditText = ({ value, onSave, minWidth = 120, placeholder }: InlineEditTextProps) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = spanRef.current;
    if (el) {
      setShowTooltip(el.scrollHeight > el.offsetHeight);
    }
  }, [value, placeholder]);

  const handleSave = () => {
    if (inputValue.trim() && inputValue !== value) {
      onSave(inputValue.trim());
    }
    setEditing(false);
  };

  const spanContent = (
    <span
      ref={spanRef}
      style={{
        cursor: 'pointer',
        paddingLeft: 8,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
        maxWidth: 220,
        fontWeight: 600,
        fontSize: 13,
        color: value ? '#333' : '#bbb',
        fontStyle: value ? 'normal' : 'italic',
      }}
      onClick={() => {
        setInputValue(value);
        setEditing(true);
      }}
      title="Nhấn để chỉnh sửa"
    >
      {value || placeholder || 'Chưa có tên'}
    </span>
  );

  return editing ? (
    <Input
      size="small"
      value={inputValue}
      autoFocus
      style={{
        minWidth,
        fontWeight: 600,
        fontSize: 13,
        color: '#333',
      }}
      placeholder={placeholder}
      onChange={e => setInputValue(e.target.value)}
      onBlur={handleSave}
      onPressEnter={handleSave}
      onKeyDown={e => {
        if (e.key === 'Escape') setEditing(false);
      }}
      variant="borderless"
    />
  ) : showTooltip ? (
    <Tooltip title={value || placeholder || 'Chưa có tên'}>{spanContent}</Tooltip>
  ) : (
    spanContent
  );
};

export default InlineEditText;
