import { PRESET_COLORS } from '@/constants';
import { Popover, ColorPicker as AntdColorPicker } from 'antd';
import { useState } from 'react';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  size?: number;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#EA580C',
  onChange,
  size = 8,
}) => {
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange?.(color);
    setOpen(false);
  };

  const handleCustomColorChange = (color: any) => {
    const hexColor = typeof color === 'string' ? color : color.toHexString();
    onChange?.(hexColor);
  };

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
            onMouseEnter={e => {
              if (value !== color) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ))}
      </div>

      {/* Custom color picker button */}
      <AntdColorPicker
        value={value}
        onChange={handleCustomColorChange}
        trigger="click"
        placement="right"
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
            transition: 'all 0.2s ease',
            textAlign: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#1890ff';
            e.currentTarget.style.backgroundColor = '#f0f9ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.backgroundColor = 'transparent';
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
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1060 }}
    >
      <div
        style={{
          width: `${size + 4}px`,
          height: `${size + 4}px`,
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: value,
          }}
        />
      </div>
    </Popover>
  );
};
