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

  const isPrivilegedRole = React.useMemo(() => {
    if (!identity) return false;
    const isGlobalSuperadmin = identity.role === UserRole.SUPERADMIN;
    const isCNBM = identity.role === UserRole.CNBM;

    const memberEntry =
      membersData?.data?.find((m: any) => m.userId === identity.id || m.id === identity.id) || null;
    const isWorkspaceAdminOrOwner =
      !!memberEntry && (memberEntry.role === 'admin' || memberEntry.role === 'owner');

    const isWorkspaceOwner =
      currentWorkspace?.ownerName && identity.name === currentWorkspace.ownerName;

    return isGlobalSuperadmin || isCNBM || isWorkspaceAdminOrOwner || isWorkspaceOwner;
  }, [identity, membersData?.data, currentWorkspace]);

  return (
    <div style={{ padding: '20px' }}>
      {isPrivilegedRole && (
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

      <>
        <Title level={4} style={{ margin: '16px 0' }}>
          Cá nhân
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
    </div>
  );
};
