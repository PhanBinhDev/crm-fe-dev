import React from "react";
import { Dropdown, Button } from "antd";
import { IActivity } from "@/common/types";
import { IconSortAscendingLetters } from "@tabler/icons-react";

type Mode = "title_asc" | "title_desc" | "created_desc" | "created_asc";

interface SortActiveProps {
  activities: IActivity[];
  onSorted: (sorted: IActivity[]) => void;
}

const SortActive: React.FC<SortActiveProps> = ({ activities, onSorted }) => {
  const handleSort = (mode: Mode) => {
    let sorted = [...activities];

    switch (mode) {
      case "title_asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "title_desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "created_desc":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "created_asc":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
    }

    onSorted(sorted); 
  };

  const menuItems = [
    { key: "title_asc", label: "Tên A → Z", onClick: () => handleSort("title_asc") },
    { key: "title_desc", label: "Tên Z → A", onClick: () => handleSort("title_desc") },
    { key: "created_desc", label: "Ngày tạo mới nhất", onClick: () => handleSort("created_desc") },
    { key: "created_asc", label: "Ngày tạo cũ nhất", onClick: () => handleSort("created_asc") },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <Button
        type="default"
        style={{
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        icon={<IconSortAscendingLetters size={18} stroke={2} color="#8c8c8c" />}
      />
    </Dropdown>
  );
};

export default SortActive;
