import { UserRole } from '@/common/enum/user';
import { IStage } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { Card, Col, Row, Tabs } from 'antd';
import React from 'react';
import MemberPerformance from './components/admin/MemberPerformance';
import TeamChart from './components/admin/TeamChart';
import TeamOverview from './components/admin/TeamOverview';
import AssignedTask from './components/personal/AssignedTask';
import { Chart } from './components/personal/Chart';
import Overview from './components/personal/Overview';
import TodayTask from './components/personal/TodayTask';

export const DashboardPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();
  const [activeTab, setActiveTab] = React.useState('personal');
  const { user: identity } = useAuth();

  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  const tabs = [
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined /> Cá nhân
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Tổng quan" style={{ height: 320 }}>
                <Overview stage={(stagesData?.data as IStage[]) ?? []} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Biểu đồ tiến độ công việc" style={{ height: 320 }}>
                <Chart />
              </Card>
            </Col>
          </Row>

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
        </>
      ),
    },
  ];

  if (
    identity?.role.includes(UserRole.SUPERADMIN) ||
    identity?.role.includes(UserRole.CNBM) ||
    identity?.role.includes('owner')
  ) {
    tabs.push({
      key: 'workspace',
      label: (
        <span>
          <TeamOutlined /> Tổng quan Workspace
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Tổng quan Team" style={{ height: 300 }}>
                <TeamOverview />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Biểu đồ hiệu suất Team" style={{ height: 300 }}>
                <TeamChart />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <Card
                title="Hiệu suất thành viên"
                styles={{
                  body: { padding: 0 },
                }}
              >
                <MemberPerformance />
              </Card>
            </Col>
          </Row>
        </>
      ),
    });
  }

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} size="large" />
    </div>
  );
};
