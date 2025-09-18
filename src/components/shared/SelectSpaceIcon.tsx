import { useState } from 'react';
import { Popover, Input, Button } from 'antd';
import * as TablerIcons from '@tabler/icons-react';

const COLORS = [
  '#6c63ff', '#007aff', '#00b7ff', '#00d59e', '#52c41a', '#ffbe00', '#ff8d00', '#ff0036', '#a163e7', '#000'
];

export default function SelectSpaceIcon({ value, onChange }: {
  value?: { icon?: string; color?: string; avatar?: string };
  onChange?: (val: { icon?: string; color?: string; avatar?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = Object.entries(TablerIcons).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  let CurrentIcon: any = null;
  if (value?.icon && typeof TablerIcons[value.icon as keyof typeof TablerIcons] === 'function') {
    CurrentIcon = TablerIcons[value.icon as keyof typeof TablerIcons];
  }
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div style={{ width: 320 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Space color</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {COLORS.map(color => (
                <div
                  key={color}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: value?.color === color ? '2px solid #333' : 'none' }}
                  onClick={() => onChange?.({ ...value, color, icon: undefined, avatar: undefined })}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Input
              placeholder="Search avatars"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="dashed">+ Upload</Button>
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {filteredIcons.map(([name, IconComponent]) => {
              const Icon = IconComponent as any;
              return (
                <div
                  key={name}
                  style={{ cursor: 'pointer', padding: 4, borderRadius: 4, background: value?.icon === name ? '#eee' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => onChange?.({ ...value, icon: name, color: undefined, avatar: undefined })}
                >
                  <Icon size={22} />
                </div>
              );
            })}
          </div>
        </div>
      }
      trigger="click"
      placement="bottom"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d9d9d9', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', minWidth: 80 }}>
        {CurrentIcon ? (
          <CurrentIcon size={24} />
        ) : value?.color ? (
          <div style={{ width: 24, height: 24, borderRadius: 4, background: value?.color || '#eee' }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 4, background: '#eee' }} />
        )}
        {/* Không hiển thị tên icon */}
        <Button type="text" onClick={e => { e.stopPropagation(); onChange?.({}); }}>
          X
        </Button>
        <Button type="text" onClick={e => { e.stopPropagation(); setOpen(true); }}>
          ✏️
        </Button>
      </div>
    </Popover>
  );
}
