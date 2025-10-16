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

    return data;
  }, [tableProps.dataSource, search, year, status]);

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
            onPageSizeChange={setPageSize}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SemesterList;
