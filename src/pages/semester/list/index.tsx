import { ISemester } from '@/common/types/semester';
import { useTable } from '@refinedev/antd';
import { Card, Row, Col } from 'antd';
import { useState, useMemo } from 'react';
import { SemesterActions, SemesterFilters, SemesterTable } from './components';


export const SemesterList = () => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [yearValue, setYearValue] = useState<number | undefined>(undefined);

  const [filters, setFilters] = useState<{
    isActive?: boolean;
  }>({
    isActive: undefined,
  });

  const dynamicFilters = useMemo(() => {
    const filterList: Array<{ field: string; operator: 'contains' | 'eq'; value: any }> = [];

    if (searchText) {
      filterList.push({ field: 'q', operator: 'contains', value: searchText });
    }

    if (filters.isActive !== undefined) {
      filterList.push({ field: 'isActive', operator: 'eq', value: filters.isActive });
    }

    return filterList;
  }, [searchText, filters.isActive]);

  const { tableProps } = useTable<ISemester>({
    resource: 'semesters',
    pagination: {
      pageSize: pageSize,
    },
    filters: {
      permanent: dynamicFilters,
    },
    sorters: {
      initial: [
        {
          field: 'startDate',
          order: 'desc',
        },
      ],
    },
    errorNotification: false,
    queryOptions: {
      retry: false,
    },
  });

  const handleReset = () => {
    setSearchText('');
    setFilters({ isActive: undefined });
  };

  return (
    <Card>
      <Row gutter={[0, 16]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SemesterFilters
            searchValue={searchText}
            statusValue={filters.isActive}
            onSearch={setSearchText}
            onYearFilter={setYearValue}
            onStatusFilter={value => setFilters(prev => ({ ...prev, isActive: value }))}
            onReset={handleReset}
          />
          <SemesterActions />
        </Col>
        <Col span={24}>
          <SemesterTable tableProps={tableProps} onPageSizeChange={setPageSize} />
        </Col>
      </Row>
    </Card>
    
  );
};
