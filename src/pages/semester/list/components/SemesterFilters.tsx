import { FC, useState } from "react";
import {
  Input,
  Select,
  Space,
  Button,
  Dropdown,
  InputNumber,
} from "antd";
import { ReloadOutlined, FilterOutlined } from "@ant-design/icons";

interface SemesterFiltersProps {
  searchValue?: string;
  yearValue?: number | null;
  statusValue?: string | null;
  onSearch: (value: string) => void;
  onYearChange: (value: number | null) => void;
  onStatusChange: (value: string | null) => void;
  onReset: () => void;
}

const SemesterFilters: FC<SemesterFiltersProps> = ({
  searchValue,
  yearValue,
  statusValue,
  onSearch,
  onYearChange,
  onStatusChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Space wrap>
      {/* Search */}
      <Input.Search
        placeholder="Tìm theo tên kỳ học"
        allowClear
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        style={{ width: 220 }}
      />

      {/* Filter dropdown */}
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        placement="bottomRight"
        dropdownRender={() => (
          <div
            style={{
              padding: 12,
              background: "#fff",
              borderRadius: 8,
              boxShadow:
                "0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.05)",
              width: 260,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <div style={{ fontWeight: 600 }}>Bộ lọc</div>

              {/* Lọc theo năm: cho nhập số */}
              <InputNumber
                placeholder="Nhập năm"
                style={{ width: "100%" }}
                value={yearValue ?? undefined}
                onChange={(val) => onYearChange(val ?? null)}
                min={1900}
                max={2100}
              />

              {/* Lọc theo trạng thái */}
              <Select<string>
                allowClear
                placeholder="Chọn trạng thái"
                style={{ width: "100%" }}
                value={statusValue ?? undefined}
                onChange={(val) => onStatusChange(val ?? null)}
                options={[
                  { label: "Ongoing (Đang diễn ra)", value: "Ongoing" },
                  { label: "Completed (Đã hoàn thành)", value: "Completed" },
                  { label: "Upcoming (Sắp diễn ra)", value: "Upcoming" },
                ]}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Button type="link" onClick={onReset} icon={<ReloadOutlined />}>
                  Đặt lại
                </Button>
                <Button type="primary" onClick={() => setOpen(false)}>
                  Áp dụng
                </Button>
              </div>
            </Space>
          </div>
        )}
      >
        <Button icon={<FilterOutlined />}>Filter</Button>
      </Dropdown>
    </Space>
  );
};

export default SemesterFilters;
