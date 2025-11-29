import { IStage, IUser } from '@/common/types';
import AssigneeActivity from '@/pages/workspace/components/AssigneeActivity';
import { toTitleCase } from '@/utils/formatter';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button, DatePicker, Divider, Popover, Select, Space, Tooltip, Typography } from 'antd';
import { Dayjs } from 'dayjs';
import { useState } from 'react';

const { Title } = Typography;

export interface FilterParams {
  priority?: string;
  stageId?: string;
  category?: string;
  endTimeTo?: string;
  endTimeFrom?: string;
  createdBy?: string;
  type?: 'task' | 'event';
  eventType?: 'seminar' | 'workshop' | 'tutor';
  assigneeId?: string;
}

const FilterActivities = ({
  onApply,
  stages,
}: {
  onApply?: (params: FilterParams) => void;
  stages: IStage[];
}) => {
  const [filters, setFilters] = useState<{
    endDate: Dayjs | null;
    priority?: string;
    stageId?: string;
    category?: string;
    keyword: string;
    type?: 'task' | 'event';
    eventType?: 'seminar' | 'workshop' | 'tutor';
    assignee?: IUser | null;
  }>({
    endDate: null,
    priority: undefined,
    stageId: undefined,
    category: undefined,
    keyword: '',
    type: undefined,
    eventType: undefined,
    assignee: null,
  });

  const [open, setOpen] = useState(false);

  const hasActiveFilter =
    !!filters.endDate ||
    !!filters.priority ||
    !!filters.stageId ||
    !!filters.category ||
    !!filters.keyword ||
    !!filters.type ||
    !!filters.eventType ||
    !!filters.assignee;

  const handleApply = () => {
    const params: FilterParams = {};

    if (filters.priority) params.priority = filters.priority;
    if (filters.stageId) params.stageId = filters.stageId;
    if (filters.category) params.category = filters.category;
    if (filters.type) params.type = filters.type;
    if (filters.type === 'event' && filters.eventType) {
      params.eventType = filters.eventType;
    }

    if (filters.endDate) {
      params.endTimeFrom = filters.endDate.startOf('day').toISOString();
      params.endTimeTo = filters.endDate.endOf('day').toISOString();
    }

    if (filters.assignee) params.assigneeId = filters.assignee.id;

    if (filters.keyword) params.createdBy = filters.keyword;

   
    onApply?.(params);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters({
      endDate: null,
      priority: undefined,
      stageId: undefined,
      category: undefined,
      keyword: '',
      type: undefined,
      eventType: undefined,
      assignee: null,
    });
    onApply?.({});
  };

  const content = (
    <div style={{ width: 320 }}>
      <Title level={5} style={{ margin: 0, fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
        Bộ lọc
      </Title>
      <Divider style={{ margin: '8px 0' }} />

      {/* End date */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Ngày kết thúc</div>
        <DatePicker
          style={{ width: '100%' }}
          value={filters.endDate}
          onChange={val => setFilters({ ...filters, endDate: val })}
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
          options={stages.map(stage => ({ label: toTitleCase(stage.title), value: stage.id }))}
        />
      </div>

      {/* Type: Task or Event */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Loại</div>
        <Select
          placeholder="Chọn loại"
          value={filters.type}
          onChange={val => setFilters({ ...filters, type: val, eventType: undefined })}
          style={{ width: '100%' }}
          allowClear
          options={[
            { label: 'Công việc', value: 'task' },
            { label: 'Sự kiện', value: 'event' },
          ]}
        />
      </div>

      {filters.type === 'event' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Loại sự kiện</div>
          <Select
            placeholder="Chọn loại sự kiện"
            value={filters.eventType}
            onChange={val => setFilters({ ...filters, eventType: val })}
            style={{ width: '100%' }}
            allowClear
            options={[
              { label: 'Seminar', value: 'seminar' },
              { label: 'Workshop', value: 'workshop' },
              { label: 'Tutor', value: 'tutor' },
            ]}
          />
        </div>
      )}

      {/* Assignee */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Người phụ trách</div>
        <AssigneeActivity
          selectedUser={filters.assignee ? [filters.assignee] : []}
          onToggleSelectUser={user => setFilters({ ...filters, assignee: user })}
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
