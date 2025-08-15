import React from 'react';
import { Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

interface KanbanFilterPopoverProps {
  searchTerm: string;
  selectedPriority?: string;
  selectedStatus?: string;
  dateRange: [any, any] | null;
  onSearch: (value: string) => void;
  onPriorityChange: (value?: string) => void;
  onStatusChange: (value?: string) => void;
  onDateRangeChange: (value: [any, any] | null) => void;
  onClearAll: () => void;
}

export const KanbanFilterPopover: React.FC<KanbanFilterPopoverProps> = ({
  searchTerm,
  selectedPriority,
  selectedStatus,
  dateRange,
  onSearch,
  onPriorityChange,
  onStatusChange,
  onDateRangeChange,
  onClearAll,
}) => (
  <div style={{ minWidth: 300, maxWidth: 400, padding: 16 }}>
    <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontWeight: 500 }}>Lọc</span>
      <Button type="link" size="small" icon={<ClearOutlined />} onClick={onClearAll}>
        Xóa tất cả
      </Button>
    </Space>
    <Input
      placeholder="Tìm kiếm hoạt động..."
      prefix={<SearchOutlined />}
      value={searchTerm}
      onChange={e => onSearch(e.target.value)}
      allowClear
      size="middle"
      style={{ marginBottom: 8 }}
    />
    <Select
      placeholder="Độ ưu tiên"
      value={selectedPriority}
      onChange={onPriorityChange}
      allowClear
      style={{ width: '100%', marginBottom: 8 }}
      options={[
        { label: 'Cao', value: 'high' },
        { label: 'Trung bình', value: 'medium' },
        { label: 'Thấp', value: 'low' },
      ]}
    />
    <Select
      placeholder="Trạng thái"
      value={selectedStatus}
      onChange={onStatusChange}
      allowClear
      style={{ width: '100%', marginBottom: 8 }}
      options={[
        { label: 'Mới', value: 'new' },
        { label: 'Đang làm', value: 'inprogress' },
        { label: 'Hoàn thành', value: 'done' },
      ]}
    />
    <DatePicker.RangePicker
      value={dateRange}
      onChange={onDateRangeChange}
      style={{ width: '100%', marginBottom: 8 }}
      allowClear
    />
  </div>
);
