import { UserRole } from '@/common/enum/user';
import { IMember, IStage } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { Card, Col, Row, Typography } from 'antd';
import React from 'react';
import MemberPerformance from './components/admin/MemberPerformance';
import TeamChart from './components/admin/TeamChart';
import TeamOverview from './components/admin/TeamOverview';
import AssignedTask from './components/personal/AssignedTask';
import { Chart } from './components/personal/Chart';
import Overview from './components/personal/Overview';
import TodayTask from './components/personal/TodayTask';

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();
  const { user: identity } = useAuth();

  const { data: membersData } = useList<IMember>({
    resource: `workspaces/${currentWorkspace?.id}/members`,
    pagination: { mode: 'off' },
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  const { data: stagesData } = useList({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });
  console.log('ws', currentWorkspace);
  const isAdminRole =
    (identity?.id.includes(
      membersData?.data.find(
        (member: any) =>
          member.id === identity?.id && (member.role === 'admin' || member.role === 'owner'),
      )?.id || '',
    ) &&
      identity?.role.includes(UserRole.SUPERADMIN)) ||
    identity?.role.includes(UserRole.CNBM) ||
    identity?.name === currentWorkspace?.ownerName;

  return (
    <div style={{ padding: '20px' }}>
      {/* Personal Dashboard - Hiển thị cho tất cả roles */}
      {!isAdminRole && (
        <>
          <Title level={4} style={{ marginBottom: 16 }}>
            Dashboard Cá nhân
          </Title>

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

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
      )}

      {/* Workspace Dashboard - Chỉ hiển thị cho admin, cnbm, owner */}
      {isAdminRole && (
        <>
          <Title level={4} style={{ marginBottom: 16 }}>
            Tổng quan Workspace
          </Title>

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

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
      )}
    </div>
  );
};
