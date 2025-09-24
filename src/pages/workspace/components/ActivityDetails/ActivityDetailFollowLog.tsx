import {
  IconArchive,
  IconBell,
  IconCalendarDue,
  IconCheck,
  IconChecks,
  IconHeading,
  IconListDetails,
  IconMessage,
  IconPaperclip,
  IconTextCaption,
} from '@tabler/icons-react';
import { Button, Divider, Input, Popover, Space, Tooltip } from 'antd';
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

const ActivityDetailFollowLog = () => {
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
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <Space
          direction="vertical"
          style={{
            gap: 0,
            padding: '8px',
            paddingBottom: '0px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Tooltip placement="left" title="Thông báo cho tôi liên quan đến hoạt động này">
            <Button
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '0 6px',
                alignItems: 'center',
              }}
              type="text"
              size="middle"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconBell size={14} color="#838383" />
                <span
                  style={{
                    fontWeight: 600,
                  }}
                >
                  Theo dõi
                </span>
              </div>
              {true && <IconCheck size={14} color="#838383" />}
            </Button>
          </Tooltip>
          <Tooltip placement="left" title="Thông báo cho tôi liên quan đến hoạt động này">
            <Button
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '6px',
                alignItems: 'center',
              }}
              type="text"
              size="middle"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconBell size={14} color="#838383" />
                <span
                  style={{
                    fontWeight: 600,
                  }}
                >
                  Theo dõi
                </span>
              </div>
              {true && <IconCheck size={14} color="#838383" />}
            </Button>
          </Tooltip>
        </Space>
        <Divider
          size="small"
          // style={{
          //   margin: 0,
          // }}
        />
        {/* <hr /> */}
        <Space>
          <Input placeholder="Tìm kiếm..." />
        </Space>
      </Space>
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
          padding: '0',
          width: 260,
        },
      }}
    >
      <Button
        type="text"
        style={{
          borderRadius: 8,
          justifyContent: 'flex-start',
          gap: 4,
          padding: '0 8px',
        }}
      >
        <IconBell size={16} stroke={1.5} color="#646464" />
        <span style={{ fontSize: 14, color: '#646464', fontWeight: 500 }}>4</span>
      </Button>
    </Popover>
  );
};

export default ActivityDetailFollowLog;
