import { PRESET_COLORS } from '@/constants';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
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
  iconColor?: string;
  showRealColor?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#EA580C',
  onChange,
  size = 16,
  disabled = false,
  stageTitle,
  showRealColor = false,
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
  const getContrastColor = (hex: string) => {
    if (!hex) return '#8c8c8c';
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 160 ? '#000' : '#fff';
  };

  const iconVisibleColor = showRealColor ? value : getContrastColor(value);

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
      {stageTitle?.toLowerCase().includes('done') ? (
        <IconCircleDashedCheck size={size} color={value ? '#fff' : '#8c8c8c'} stroke={2} />
      ) : (
        <IconCircleDashed size={size} color={iconVisibleColor} stroke={2} />
      )}
    </Popover>
  );
};
