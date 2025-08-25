import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Input, Button, Spin } from 'antd';
import { IconCheck, IconPencil, IconTrash } from '@tabler/icons-react';

type IconEntry = { key: string; Comp: React.FC<any> };

interface SelectIconProps {
  value?: string;
  onChange?: (key: string) => void;
  allowClear?: boolean;
  size?: number;
}

const SelectIcon: React.FC<SelectIconProps> = ({
  value,
  onChange,
  allowClear = true,
  size = 18,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<IconEntry[] | null>(null);
  const [selected, setSelected] = useState<string>(value || '');

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  // load icons dynamically once when modal first opens (or on mount)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('@tabler/icons-react');

        const entries = Object.entries(mod)
          .filter(([k, v]) => {
            if (!k.startsWith('Icon')) return false;

            // Tabler export can be a function or a forwardRef object (has $$typeof / render)
            const isComponent =
              typeof v === 'function' || (typeof v === 'object' && v !== null && 'render' in v);
            return isComponent;
          })
          .map(([k, v]) => ({ key: k, Comp: v as React.FC<any> }));

        if (mounted) {
          entries.sort((a, b) => a.key.localeCompare(b.key));
          setIcons(entries);
        }
      } catch (e) {
        console.error('Failed to load tabler icons', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!icons) return [];
    const q = query.trim().toLowerCase();
    const list = icons.filter(
      i => i.key.toLowerCase().includes(q) || i.key.replace(/^Icon/, '').toLowerCase().includes(q),
    );
    return list.slice(0, 300);
  }, [icons, query]);

  const handleSelect = (key: string) => {
    setSelected(key);
    onChange?.(key);
    setOpen(false);
  };

  const clear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelected('');
    onChange?.('');
  };

  const SelectedComp = useMemo(() => {
    if (!icons) return null;
    return icons.find(i => i.key === selected)?.Comp ?? null;
  }, [icons, selected]);

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e8e8e8',
            background: '#fff',
            cursor: 'pointer',
            minWidth: 160,
            width: '100%',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: '#f5f5f5',
            }}
          >
            {SelectedComp ? (
              <SelectedComp size={size} />
            ) : (
              <div style={{ width: size, height: size }} />
            )}
          </div>
          <div style={{ flex: 1, fontSize: 14, color: '#111' }}>
            {selected ? selected.replace(/^Icon/, '') : 'Chọn icon'}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {allowClear && selected && (
              <Button
                color="danger"
                size="small"
                variant="text"
                onClick={clear}
                icon={<IconTrash size={14} />}
                aria-label="Xóa"
              />
            )}
            <Button
              size="small"
              variant="text"
              onClick={() => setOpen(true)}
              icon={<IconPencil size={14} />}
              aria-label="Thay đổi"
            />
          </div>
        </div>
      </div>

      <Modal
        title="Chọn icon"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        destroyOnHidden
        width={520}
        styles={{ body: { paddingBottom: 12 } }}
      >
        {!icons ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
            <div style={{ marginTop: 8, color: '#888' }}>Đang tải icon…</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <Input
                placeholder="Tìm icon (ví dụ: users, folder, star...)"
                allowClear
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                maxHeight: 360,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: 12,
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {filtered.map(icon => {
                const IconComp = icon.Comp;
                const active = icon.key === selected;
                return (
                  <button
                    key={icon.key}
                    onClick={() => handleSelect(icon.key)}
                    type="button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: 6,
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      borderRadius: 8,
                      border: active ? '2px solid #1890ff' : '1px solid #eee',
                      background: active ? '#e6f7ff' : '#fff',
                      cursor: 'pointer',
                      aspectRatio: '1 / 1',
                      justifyContent: 'center',
                    }}
                    aria-pressed={active}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        background: active ? '#fff' : '#fafafa',
                        boxSizing: 'border-box',
                      }}
                    >
                      <IconComp size={18} />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#333',
                        textAlign: 'center',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {icon.key.replace(/^Icon/, '')}
                    </div>
                    {active && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconCheck size={14} color="#1890ff" />
                        <span style={{ fontSize: 12, color: '#1890ff' }}>Đang chọn</span>
                      </div>
                    )}
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div
                  style={{ gridColumn: '1/-1', color: '#888', textAlign: 'center', padding: 24 }}
                >
                  Không tìm thấy icon.
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default SelectIcon;
