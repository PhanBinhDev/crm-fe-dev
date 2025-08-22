import React, { useState, useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { Card, Col, Row } from "antd";
import SemesterTable from "./components/SemesterTable";
import { SemesterActions } from "./components/SemesterActions";
import SemesterFilters from "./components/SemesterFilters";

const SemesterList: React.FC = () => {
  const [pageSize, setPageSize] = useState(10);

  // state filter
  const [search, setSearch] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string>("");

  // dữ liệu gốc từ useTable
  const { tableProps } = useTable({
    resource: "semesters",
    pagination: { pageSize },
    errorNotification: false,
    queryOptions: { retry: false },
    syncWithLocation: true,
  });

  // lọc dữ liệu ở client
  const filteredData = useMemo(() => {
    let data = tableProps.dataSource ?? [];

    // tìm kiếm theo tên
    if (search) {
      data = data.filter((item: any) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // lọc theo năm
    if (year !== undefined) {
      data = data.filter((item: any) => item.year === year);
    }

    // lọc theo trạng thái
    if (status !== undefined) {
      data = data.filter((item: any) => item.status === status);
    }

    // sắp xếp
    if (sort) {
      data = [...data].sort((a: any, b: any) => {
        switch (sort) {
          case "nameAsc":
            return a.name.localeCompare(b.name);
          case "nameDesc":
            return b.name.localeCompare(a.name);
          case "yearAsc":
            return a.year - b.year;
          case "yearDesc":
            return b.year - a.year;
          default:
            return 0;
        }
      });
    }

    return data;
  }, [tableProps.dataSource, search, year, status, sort]);

  return (
    <Card>
      {/* bộ lọc */}
      <SemesterFilters
        searchValue={search}
        yearValue={year}
        statusValue={status}
        sortValue={sort}
        onSearch={setSearch}
        onYearChange={(value) => setYear(value === null ? undefined : value)}
        onStatusChange={(value) => setStatus(value === null ? undefined : value)}
        onSortChange={setSort}
        onReset={() => {
          setSearch("");
          setYear(undefined);
          setStatus(undefined);
          setSort("");
        }}
      />

      <Row gutter={[0, 16]}>
        <Col
          span={24}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div />
          <SemesterActions />
        </Col>
        <Col span={24}>
          {/* thay dataSource bằng filteredData */}
          <SemesterTable
            tableProps={{ ...tableProps, dataSource: filteredData }}
            onPageSizeChange={setPageSize}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default SemesterList;
