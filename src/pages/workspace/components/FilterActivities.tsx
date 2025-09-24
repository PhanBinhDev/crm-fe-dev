import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button, DatePicker, Divider, Popover, Select, Space, Tooltip, Typography } from 'antd';
import { Dayjs } from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export interface FilterParams {
  priority?: string;
  stageId?: string;
  category?: string;
  startTimeFrom?: string;
  endTimeTo?: string;
  createdBy?: string;
}

const FilterActivities = ({ onApply }: { onApply?: (params: FilterParams) => void }) => {
  const [filters, setFilters] = useState<{
    date: [Dayjs | null, Dayjs | null] | null;
    priority?: string;
    stageId?: string;
    category?: string;
    keyword: string;
  }>({
    date: null,
    priority: undefined,
    stageId: undefined,
    category: undefined,
    keyword: '',
  });

  const [open, setOpen] = useState(false);

  const hasActiveFilter =
    (filters.date && (filters.date[0] || filters.date[1])) ||
    !!filters.priority ||
    !!filters.stageId ||
    !!filters.category ||
    filters.keyword !== '';

  const handleApply = () => {
    const params: FilterParams = {};

    if (filters.priority) params.priority = filters.priority;
    if (filters.stageId) params.stageId = filters.stageId;
    if (filters.category) params.category = filters.category;
    if (filters.date) {
      const [start, end] = filters.date;

      if (start) {
        params.startTimeFrom = start.startOf('day').toISOString();
      }
      if (end) {
        params.endTimeTo = end.endOf('day').toISOString();
      }
    }

    if (filters.keyword) params.createdBy = filters.keyword;

    onApply?.(params);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters({
      date: null,
      priority: undefined,
      stageId: undefined,
      category: undefined,
      keyword: '',
    });
    onApply?.({});
  };

  const content = (
    <div style={{ width: 320 }}>
      <Title level={5} style={{ margin: 0, fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
        Bộ lọc
      </Title>
      <Divider style={{ margin: '8px 0' }} />

      {/* Date range */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Thời gian</div>
        <RangePicker
          style={{ width: '100%' }}
          value={filters.date as any}
          onChange={val => setFilters({ ...filters, date: val })}
        />
      </div>

      {/* Priority */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Độ ưu tiên</div>
        <Select
          placeholder="Chọn mức độ"
          value={filters.priority}
          onChange={val => setFilters({ ...filters, priority: val })}
          style={{ width: '100%' }}
          options={[
            { label: 'Thấp', value: 'low' },
            { label: 'Trung bình', value: 'medium' },
            { label: 'Cao', value: 'high' },
            { label: 'Khẩn cấp', value: 'urgent' },
          ]}
        />
      </div>

      {/* Status */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Trạng thái</div>
        <Select
          placeholder="Chọn trạng thái"
          value={filters.stageId}
          onChange={val => setFilters({ ...filters, stageId: val })}
          style={{ width: '100%' }}
          options={[
            { label: 'Todo', value: '206af35c-b8d3-4875-aeca-6d5fca418701' },
            { label: 'In Progress', value: 'b833ae4c-dd1f-45e9-93fb-dd556e759ef7' },
            { label: 'Done', value: '452c0784-2b3b-45ad-ae49-2891d3826cbd' },
            { label: 'Complete', value: '98a2c2ec-58cb-4dcf-b5d2-81e3cdbb9e53' },
          ]}
        />
      </div>

      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleReset}>Làm mới</Button>
        <Button type="primary" onClick={handleApply}>
          Áp dụng
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover
      placement="bottomLeft"
      trigger="click"
      content={content}
      open={open}
      onOpenChange={setOpen}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Tooltip title="Lọc hoạt động">
          <Button
            icon={
              <IconAdjustmentsHorizontal
                size={16}
                color={hasActiveFilter ? '#1677ff' : '#8c8c8c'}
              />
            }
            style={{
              borderRadius: 8,
              background: hasActiveFilter ? '#e6f4ff' : '#f5f5f5',
              width: 36,
              height: 36,
            }}
          />
        </Tooltip>

        {hasActiveFilter && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#52c41a',
              border: '2px solid #fff',
              boxShadow: '0 0 4px rgba(0,0,0,0.15)',
            }}
          />
        )}
      </div>
    </Popover>
  );
};

export default FilterActivities;
