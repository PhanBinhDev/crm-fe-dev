import { FC } from 'react';
import { Input, Select, Space, Button, InputNumber } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';


interface SemesterFiltersProps {
  searchValue?: string;
  yearValue?: number | null; // <-- thêm null
  statusValue?: string | null;
  sortValue?: string;
  onSearch: (value: string) => void;
  onYearChange: (value: number | null) => void;
  onStatusChange: (value: string | null) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

const SemesterFilters: FC<SemesterFiltersProps> = ({
  searchValue,
  yearValue,
  statusValue,
  sortValue,
  onSearch,
  onYearChange,
  onStatusChange,
  onSortChange,
  onReset,
}) => {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input
        placeholder="Tìm theo tên kỳ học"
        allowClear
        value={searchValue}
        onChange={e => onSearch(e.target.value)}
        style={{ width: 200 }}
      />

      {/* Lọc theo năm */}
      <InputNumber
        placeholder="Nhập năm"
        style={{ width: 150 }}
        value={yearValue ?? undefined}
        onChange={onYearChange}
        min={1900}
        max={2100}
      />

      {/* Lọc theo trạng thái */}
      <Select<string | undefined>
        placeholder="Trạng thái"
        allowClear
        style={{ width: 200 }}
        value={statusValue ?? undefined} // nhận string hoặc undefined
        onChange={val => onStatusChange(val ?? null)} // ép undefined -> null
        options={[
          { label: 'Ongoing (Đang diễn ra)', value: 'Ongoing' },
          { label: 'Completed (Đã hoàn thành)', value: 'Completed' },
          { label: 'Upcoming (Sắp diễn ra)', value: 'Upcoming' },
        ]}
      />

      {/* Sắp xếp */}
      <Select<string>
        placeholder="Sắp xếp"
        allowClear
        style={{ width: 180 }}
        value={sortValue}
        onChange={onSortChange}
        options={[
          { label: 'Tên (A → Z)', value: 'nameAsc' },
          { label: 'Tên (Z → A)', value: 'nameDesc' },
          { label: 'Năm (Mới → Cũ)', value: 'yearDesc' },
          { label: 'Năm (Cũ → Mới)', value: 'yearAsc' },
        ]}
      />

      {/* Nút reset */}
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
};

export default SemesterFilters;
