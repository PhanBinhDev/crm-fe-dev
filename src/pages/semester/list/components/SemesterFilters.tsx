import { FC } from "react";
import { Input, Select, Space, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Search } = Input;

interface SemesterFiltersProps {
  searchValue?: string;
  yearValue?: number;
  statusValue?: boolean;
  onSearch: (value: string) => void;
  onYearFilter: (value: number | undefined) => void; 
  onStatusFilter: (value: boolean | undefined) => void;
  onReset: () => void;
}


// Ví dụ options cho năm học
const yearOptions = [
  { label: "2023", value: 2023 },
  { label: "2024", value: 2024 },
  { label: "2025", value: 2025 },
];

// Ví dụ options cho trạng thái kỳ học
const semesterStatusOptions = [
  { label: "Đang diễn ra", value: "true" },
  { label: "Đã kết thúc", value: "false" },
];

export const SemesterFilters: FC<SemesterFiltersProps> = ({
  searchValue,
  yearValue,
  statusValue,
  onSearch,
  onYearFilter,
  onStatusFilter,
  onReset,
}) => {
  const handleStatusChange = (value: string | undefined) => {
    if (value === undefined) {
      onStatusFilter(undefined);
    } else {
      onStatusFilter(value === "true");
    }
  };

  return (
    <Space wrap>
      <Search
        placeholder="Tìm kiếm kỳ học..."
        allowClear
        value={searchValue}
        onSearch={onSearch}
        onChange={(e) => onSearch(e.target.value)}
        style={{ width: 250 }}
      />
      <Select
        placeholder="Lọc theo năm học"
        allowClear
        value={yearValue}
        style={{ width: 150 }}
        onChange={onYearFilter}
        options={yearOptions}
      />
      <Select
        placeholder="Lọc theo trạng thái"
        allowClear
        value={statusValue !== undefined ? statusValue.toString() : undefined}
        style={{ width: 150 }}
        onChange={handleStatusChange}
        options={semesterStatusOptions}
      />
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại bộ lọc
      </Button>
    </Space>
  );
};
