import React, { useState } from 'react';
import { useTable } from '@refinedev/antd';
import { Card, Col, Row } from 'antd';
import SemesterTable from './components/SemesterTable';
import { SemesterActions } from './components/SemesterActions';

const SemesterList: React.FC = () => {
  const [pageSize, setPageSize] = useState(10);

  const { tableProps } = useTable({
    resource: 'semesters',
    pagination: {
      pageSize: pageSize,
    },
    errorNotification: false,
    queryOptions: {
      retry: false,
    },
    syncWithLocation: true,
  });

  return (
    <Card>
      <Row gutter={[0, 16]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div />
          <SemesterActions />
        </Col>
        <Col span={24}>
          <SemesterTable tableProps={tableProps} onPageSizeChange={setPageSize} />
        </Col>
      </Row>
    </Card>
  );
};

export default SemesterList;
