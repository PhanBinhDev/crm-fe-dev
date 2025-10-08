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
  stageTitle?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#EA580C',
  onChange,
  size = 8,
  radius = 999,
  disabled = false,
  stageTitle,
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
      <svg width={14} height={14} viewBox="0 0 16 16" style={{ cursor: 'pointer' }}>
        {(() => {
          const size = 14;
          const strokeWidth = 1.6;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const dashCount = 8;
          const dashLength = circumference / (dashCount * 2);

          return (
            <>
              <circle
                cx="8"
                cy="8"
                r={radius}
                fill="none"
                stroke="#fff"
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${dashLength}`}
                strokeLinecap="round"
              />
              {stageTitle?.toLowerCase().includes('done') && (
                <path
                  d="M5.2 8.2l2 2.2 4-4.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          );
        })()}
      </svg>
    </Popover>
  );
};
