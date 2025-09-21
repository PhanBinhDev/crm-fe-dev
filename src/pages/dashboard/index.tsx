import { Card, Col, Row, Typography } from 'antd';
import React from 'react';
import AssignedTask from './components/AssignedTask';
import { Chart } from './components/Chart';
import Overview from './components/Overview';
import TodayTask from './components/TodayTask';

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  // Fetch dashboard stats
  // const { data: statsData } = useCustom({
  //   url: `${apiUrl}/dashboard/stats`,
  //   method: 'get',
  // });

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Tổng quan">
            <Overview />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ tiến độ công việc">
            <Chart />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Nhiệm vụ hôm nay" style={{ height: 400 }}>
            <TodayTask />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Công việc được giao" style={{ height: 400 }}>
            <AssignedTask />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
