import { PRESET_COLORS } from '@/constants';
import { ColorPicker as AntdColorPicker, Popover } from 'antd';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  size?: number;
  radius?: number;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#EA580C',
  onChange,
  size = 8,
  radius = 999,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    if (disabled) return;
    onChange?.(color);
    setOpen(false);
  };

  const debouncedCustomColorChange = useDebounceCallback((color: any) => {
    if (disabled) return;
    const hexColor = typeof color === 'string' ? color : color.toHexString();
    onChange?.(hexColor);
  }, 300);

  const ColorGrid = (
    <div style={{ padding: '12px', width: '200px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        {PRESET_COLORS.map(color => (
          <div
            key={color}
            onClick={() => handleColorSelect(color)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: color,
              cursor: 'pointer',
              border: value === color ? '2px solid #1890ff' : '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Custom color picker button */}
      <AntdColorPicker
        value={value}
        onChange={debouncedCustomColorChange}
        trigger="click"
        placement="right"
        open={disabled ? false : undefined}
      >
        <div
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px dashed #d9d9d9',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8c8c8c',
            fontSize: '12px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          Chọn màu tùy chỉnh
        </div>
      </AntdColorPicker>
    </div>
  );

  return (
    <Popover
      content={ColorGrid}
      trigger="click"
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : setOpen}
      placement="bottomLeft"
      styles={{ root: { zIndex: 1060 } }}
    >
      <div
        style={{
          width: `${size + 4}px`,
          height: `${size + 4}px`,
          borderRadius: `${radius}px`,
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${radius}px`,
            backgroundColor: value,
          }}
        />
      </div>
    </Popover>
  );
};
