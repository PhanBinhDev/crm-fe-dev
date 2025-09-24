import React from "react";
import { Dropdown, Button } from "antd";
import { useUpdate } from "@refinedev/core";
import { IStage } from "@/common/types";

const GROUP_RANGES: Record<string, { start: number; end: number }> = {
  not_started: { start: 1, end: 100 },
  active: { start: 101, end: 200 },
  done: { start: 201, end: 300 },
  closed: { start: 301, end: 400 },
};

const GROUP_LABELS: Record<string, string> = {
  not_started: "Chưa bắt đầu",
  active: "Đang thực hiện",
  done: "Hoàn thành",
  closed: "Đã đóng",
};

interface SortActiveProps {
  stages: IStage[];
  onSorted?: () => void;
}

const SortActive: React.FC<SortActiveProps> = ({ stages, onSorted }) => {
  const { mutate: updateStage } = useUpdate();

  const handleSortGroup = (groupKey: string, mode: string) => {
    const range = GROUP_RANGES[groupKey];
    const groupStages = stages.filter((s) => s.stageGroup === groupKey);

    let sorted: IStage[] = [];

    switch (mode) {
      case "title_asc":
        sorted = [...groupStages].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;
      case "title_desc":
        sorted = [...groupStages].sort((a, b) =>
          b.title.localeCompare(a.title)
        );
        break;
      case "created_asc":
        sorted = [...groupStages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "created_desc":
        sorted = [...groupStages].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        sorted = groupStages;
    }

    // Gán lại position tuần tự trong range group
    const newStages = sorted.map((s, idx) => ({
      ...s,
      position: range.start + idx,
    }));

    // Update BE
    newStages.forEach((s) => {
      updateStage({
        resource: "stages",
        id: s.id,
        values: { position: s.position },
        mutationMode: "optimistic",
        successNotification: false,
      });
    });

    if (onSorted) onSorted();
  };

  // build dropdown items
  const items = Object.keys(GROUP_RANGES).map((groupKey) => ({
    key: groupKey,
    label: GROUP_LABELS[groupKey],
    children: [
      {
        key: `${groupKey}_title_asc`,
        label: "Tên A → Z",
        onClick: () => handleSortGroup(groupKey, "title_asc"),
      },
      {
        key: `${groupKey}_title_desc`,
        label: "Tên Z → A",
        onClick: () => handleSortGroup(groupKey, "title_desc"),
      },
      {
        key: `${groupKey}_created_desc`,
        label: "Ngày tạo mới nhất",
        onClick: () => handleSortGroup(groupKey, "created_desc"),
      },
      {
        key: `${groupKey}_created_asc`,
        label: "Ngày tạo cũ nhất",
        onClick: () => handleSortGroup(groupKey, "created_asc"),
      },
    ],
  }));

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button size="small">Sắp xếp</Button>
    </Dropdown>
  );
};

export default SortActive;
