import {
  IconArchive,
  IconCalendarDue,
  IconCheck,
  IconChecks,
  IconFilter2,
  IconHeading,
  IconListDetails,
  IconMessage,
  IconPaperclip,
  IconTextCaption,
} from '@tabler/icons-react';
import { Badge, Button, List, Popover, Space, Typography } from 'antd';
import { useState } from 'react';

type ActivityLogFilterOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const activityLogFilterOptions: ActivityLogFilterOption[] = [
  {
    label: 'Thêm hoặc xóa khỏi danh sách',
    value: 'list',
    icon: <IconListDetails size={14} color="#838383" />,
  },
  { label: 'Lưu trữ', value: 'archived', icon: <IconArchive size={14} color="#838383" /> },
  { label: 'Bình luận', value: 'comments', icon: <IconMessage size={14} color="#838383" /> },
  { label: 'Danh sách việc', value: 'checklists', icon: <IconChecks size={14} color="#838383" /> },
  { label: 'Đính kèm', value: 'attachments', icon: <IconPaperclip size={14} color="#838383" /> },
  { label: 'Hạn chót', value: 'due_date', icon: <IconCalendarDue size={14} color="#838383" /> },
  { label: 'Mô tả', value: 'description', icon: <IconTextCaption size={14} color="#838383" /> },
  { label: 'Tiêu đề', value: 'title', icon: <IconHeading size={14} color="#838383" /> },
];

const ActivityDetailFilterLog = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    activityLogFilterOptions.map(opt => opt.value),
  );

  const allSelected = selected.length === activityLogFilterOptions.length;

  const handleToggle = (value: string) => {
    setSelected(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const handleSelectAll = () => setSelected(activityLogFilterOptions.map(opt => opt.value));
  const handleUnselectAll = () => setSelected([]);

  const contentFilter = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: 8,
        }}
      >
        <Typography
          style={{
            padding: '3px 12px 0',
            fontWeight: 600,
          }}
        >
          Bộ lọc
        </Typography>

        <Button
          type="text"
          size="small"
          style={{
            borderRadius: 6,
          }}
          onClick={allSelected ? handleUnselectAll : handleSelectAll}
        >
          {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </Button>
      </div>
      <List
        dataSource={activityLogFilterOptions}
        renderItem={item => (
          <List.Item
            style={{ cursor: 'pointer', padding: '8px', borderRadius: 6, border: 0 }}
            onClick={() => handleToggle(item.value)}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Space
              styles={{
                item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                },
              }}
            >
              {item.icon}
              {item.label}
            </Space>
            {selected.includes(item.value) && <IconCheck size={14} color="#8c8c8c" />}
          </List.Item>
        )}
        style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}
      />
    </Space>
  );

  return (
    <Popover
      placement="bottomRight"
      arrow={false}
      open={showFilter}
      trigger={['click']}
      onOpenChange={setShowFilter}
      content={contentFilter}
      styles={{
        body: {
          padding: '8px 0 0',
          width: 260,
        },
      }}
    >
      <Button
        type="text"
        icon={
          <Badge dot={!allSelected} offset={[-2, 2]}>
            <IconFilter2 size={16} stroke={1.5} color="#646464" />
          </Badge>
        }
        styles={{
          icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        }}
        style={{
          borderRadius: 8,
        }}
      />
    </Popover>
  );
};

export default ActivityDetailFilterLog;
