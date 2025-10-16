import { IStage } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { Card, Col, Row } from 'antd';
import React from 'react';
import AssignedTask from './components/AssignedTask';
import { Chart } from './components/Chart';
import Overview from './components/Overview';
import TodayTask from './components/TodayTask';

export const DashboardPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();

  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Tổng quan" style={{ height: 300 }}>
            <Overview stage={(stagesData?.data as IStage[]) ?? []} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Biểu đồ tiến độ công việc" style={{ height: 300 }}>
            <Chart />
          </Card>
        </Col>
      </Row>

      {/* Hàng 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card
            title="Nhiệm vụ hôm nay"
            styles={{
              body: { height: 300, padding: 0, overflow: 'hidden' },
            }}
          >
            <TodayTask />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Công việc được giao"
            styles={{
              body: { height: 300, padding: 0, overflow: 'hidden' },
            }}
          >
            <AssignedTask />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
