import React from "react";
import { Input, Button, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined,
} from "@ant-design/icons";

interface MaterialFilterProps {
  query: string;
  onQueryChange: (value: string) => void;
  view: "grid" | "list";
  onToggleView: () => void;
  onAdd: () => void;
}

const MaterialFilter: React.FC<MaterialFilterProps> = ({
  query,
  onQueryChange,
  view,
  onToggleView,
  onAdd,
}) => {
  return (
    <Space size={8}>
      <Input
        placeholder="Tìm kiếm môn học"
        allowClear
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        prefix={<SearchOutlined />}
        style={{ width: 260, borderRadius: 8, background: "#fff" }}
      />
      <Tooltip title={view === "grid" ? "Chế độ lưới" : "Chế độ danh sách"}>
        <Button
          icon={view === "grid" ? <AppstoreOutlined /> : <BarsOutlined />}
          onClick={onToggleView}
        />
      </Tooltip>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        Thêm môn học
      </Button>
    </Space>
  );
};

export default MaterialFilter;
