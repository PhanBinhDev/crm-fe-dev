import { useTable } from '@refinedev/antd';
import { Col, Row } from 'antd';
import React, { useMemo, useState } from 'react';
import { SemesterActions } from './components/SemesterActions';
import SemesterFilters from './components/SemesterFilters';
import SemesterTable from './components/SemesterTable';

const SemesterList: React.FC = () => {
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const { tableProps } = useTable({
    resource: 'semesters',
    pagination: { pageSize },
    errorNotification: false,
    queryOptions: { retry: false },
    syncWithLocation: true,
  });

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (!Array.isArray(sorter)) {
      setSortField(sorter.field || null);
      setSortOrder(sorter.order || null);
    }
  };
  const filteredData = useMemo(() => {
    let data = tableProps.dataSource ?? [];

    if (search) {
      data = data.filter((item: any) =>
        (item?.name || '').toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (year !== null) {
      data = data.filter((item: any) => item.year === year);
    }
    if (status !== null) {
      data = data.filter((item: any) => item.status === status);
    }
    if (sortField && sortOrder) {
      data = [...data].sort((a, b) => {
        const asc = sortOrder === 'ascend' ? 1 : -1;
        if (sortField === 'year') return asc * (a.year - b.year);
        if (sortField === 'name') return asc * a.name.localeCompare(b.name);
        if (sortField === 'startDate')
          return asc * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        if (sortField === 'endDate')
          return asc * (new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        return 0;
      });
    }

    return data;
  }, [tableProps.dataSource, search, year, status, sortField, sortOrder]);

  const handleReset = () => {
    setSearch('');
    setYear(null);
    setStatus(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <SemesterFilters
              searchValue={search}
              yearValue={year}
              statusValue={status}
              onSearch={setSearch}
              onYearChange={v => setYear(v)}
              onStatusChange={v => setStatus(v)}
              onReset={handleReset}
            />
            <SemesterActions />
          </div>
        </Col>
        <Col span={24}>
          <SemesterTable
            tableProps={{ ...tableProps, dataSource: filteredData }}
            onChange={handleTableChange}
            onPageSizeChange={setPageSize}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SemesterList;
