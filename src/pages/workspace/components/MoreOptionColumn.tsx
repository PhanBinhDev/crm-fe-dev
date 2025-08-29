import { useState } from 'react';
import { IconChevronDown, IconDots, IconPencil, IconPlus } from '@tabler/icons-react';
import { Popover, Tooltip } from 'antd';

interface MoreOptionColumnProps {
  onEditColumn: () => void;
  collapsed: boolean;
  onCollapseGroup: () => void;
}

const MoreOptionColumn = ({ collapsed, onEditColumn, onCollapseGroup }: MoreOptionColumnProps) => {
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    setOpen(false);
    onEditColumn();
  };

  const popoverContent = (
    <div style={{ minWidth: 120 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          borderRadius: 5,
          fontSize: 14,
          transition: 'background 0.2s',
        }}
        onClick={() => {
          setOpen(false);
          onCollapseGroup?.();
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <IconChevronDown
          size={14}
          color="#8c8c8c"
          style={{
            transform: collapsed ? 'rotate(-180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
        {collapsed ? 'Mở rộng nhóm' : 'Thu gọn nhóm'}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          borderRadius: 5,
          fontSize: 14,
          transition: 'background 0.2s',
        }}
        onClick={handleEdit}
        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <IconPencil size={14} color="#8c8c8c" />
        Sửa cột
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          borderRadius: 5,
          fontSize: 14,
          transition: 'background 0.2s',
        }}
        onClick={() => setOpen(false)}
        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <IconPlus size={14} color="#8c8c8c" />
        Thêm hoạt động
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: 6,
          borderRadius: 8,
        },
      }}
      trigger="click"
      placement="bottomRight"
    >
      <Tooltip title="Tùy chọn cột">
        <button
          style={{
            border: 'none',
            background: 'none',
            borderRadius: 6,
            padding: 4,
            minWidth: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <IconDots size={14} color="#8c8c8c" />
        </button>
      </Tooltip>
    </Popover>
  );
};

export default MoreOptionColumn;
