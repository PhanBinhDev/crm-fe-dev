// components/TeamOverview.tsx
import Spinner from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { Col, Row, Statistic } from 'antd';
import React from 'react';

const TeamOverview: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();

  // Lấy tất cả tasks của workspace
  const { data: tasksData, isLoading } = useList({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spinner />
      </div>
    );
  }

  const tasks = tasksData?.data || [];
  console.log('Tasks data in TeamOverview:', tasks);

  // Tính toán thống kê
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: any) => task.status === 'done').length;
  const overdueTasks = tasks.filter((task: any) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  }).length;
  const activeTasks = tasks.filter(
    (task: any) => task.status !== 'done' && task.status !== 'cancelled',
  ).length;

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  const cardStyle: React.CSSProperties = {
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #f0f0f0',
    borderRadius: 8,
  };

  return (
    <Row gutter={[16, 16]} justify="space-between" align="stretch">
      <Col span={12}>
        <Statistic
          style={cardStyle}
          title={<p style={{ color: 'black', fontWeight: 550 }}>Đang thực hiện</p>}
          value={activeTasks}
          prefix={<ClockCircleOutlined />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Col>
      <Col span={12}>
        <Statistic
          style={cardStyle}
          title={<p style={{ color: 'black', fontWeight: 550 }}>Trễ hạn</p>}
          value={overdueTasks}
          prefix={<ExclamationCircleOutlined />}
          valueStyle={{ color: '#ff4d4f' }}
        />
      </Col>
      <Col span={12}>
        <Statistic
          style={cardStyle}
          title={<p style={{ color: 'black', fontWeight: 550 }}>Hoàn thành</p>}
          value={completedTasks}
          prefix={<CheckCircleOutlined />}
          valueStyle={{ color: '#52c41a' }}
        />
      </Col>
      <Col span={12}>
        <Statistic
          style={cardStyle}
          title={<p style={{ color: 'black', fontWeight: 550 }}>Tỉ lệ hoàn thành</p>}
          value={completionRate}
          prefix={<RiseOutlined />}
          suffix="%"
          valueStyle={{ color: '#52c41a' }}
        />
      </Col>
    </Row>
  );
};

export default TeamOverview;
