import { IStage } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
  IconProgress,
} from '@tabler/icons-react';
import { Card, Col, Grid, Progress, Row, Spin, Typography } from 'antd';
import { useMemo } from 'react';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface OverviewProps {
  stage: IStage[];
}

const Overview = ({ stage }: OverviewProps) => {
  const screens = useBreakpoint();
  const isSmall = !screens.md;
  const { currentWorkspace } = useWorkspaces();
  const { user: identity } = useAuth();

  // Lấy tất cả tasks được giao cho user hiện tại
  const { data: tasksData, isLoading } = useList({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: [
      { field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id },
      { field: 'assigneeId', operator: 'eq', value: identity?.id },
    ],
    queryOptions: { enabled: !!currentWorkspace?.id && !!identity?.id },
  });

  // Tính toán stats dựa trên tasks thực tế
  const stats = useMemo(() => {
    if (!tasksData?.data) {
      return {
        todo: { total: 0, color: stage.find(s => s.title === 'TO DO')?.color || '#d9d9d9' },
        inProgress: {
          total: 0,
          color: stage.find(s => s.title === 'IN PROGRESS')?.color || '#1890ff',
        },
        complete: { total: 0, color: stage.find(s => s.title === 'COMPLETE')?.color || '#52c41a' },
        overdue: { total: 0, color: stage.find(s => s.title === 'OVERDUE')?.color || '#ff4d4f' },
      };
    }

    const tasks = tasksData.data;
    const now = new Date();

    // Tìm stage IDs
    const todoStage = stage.find(s => s.stageGroup === 'not_started');
    const inProgressStage = stage.find(s => s.stageGroup === 'active');
    const completeStage = stage.find(s => s.stageGroup === 'done');

    // Đếm tasks theo từng trạng thái
    const todoTasks = tasks.filter((task: any) => task.stageId === todoStage?.id);
    const inProgressTasks = tasks.filter((task: any) => task.stageId === inProgressStage?.id);
    const completeTasks = tasks.filter((task: any) => task.stageId === completeStage?.id);

    // Đếm tasks trễ hạn (chưa hoàn thành + quá hạn)
    const overdueTasks = tasks.filter((task: any) => {
      if (!task.dueDate || task.stageId === completeStage?.id) return false;
      return new Date(task.dueDate) < now;
    });

    return {
      todo: {
        total: todoTasks.length,
        color: todoStage?.color || '#d9d9d9',
      },
      inProgress: {
        total: inProgressTasks.length,
        color: inProgressStage?.color || '#1890ff',
      },
      complete: {
        total: completeTasks.length,
        color: completeStage?.color || '#52c41a',
      },
      overdue: {
        total: overdueTasks.length,
        color: '#ff4d4f',
      },
    };
  }, [tasksData, stage]);

  const cardStyle: React.CSSProperties = {
    padding: isSmall ? '8px' : '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textStyle: React.CSSProperties = {
    fontSize: isSmall ? 10 : 12,
  };

  const numberStyle: React.CSSProperties = {
    fontSize: isSmall ? 16 : 20,
    fontWeight: 600,
  };

  const iconSize = isSmall ? 10 : 13;

  // Tính tổng và phần trăm hoàn thành
  const overall =
    (stats.todo.total || 0) +
    (stats.inProgress.total || 0) +
    (stats.complete.total || 0) +
    (stats.overdue.total || 0);

  const percent = overall > 0 ? (stats.complete.total / overall) * 100 : 0;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin />
      </div>
    );
  }

  return (
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
          <Progress type="circle" percent={Math.round(percent)} size={120} />
        </div>
      </Col>
      <Col xs={6}>
        <Card bodyStyle={cardStyle}>
          <Text style={numberStyle}>{stats.todo.total || 0}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconCircleDashed size={iconSize} color={stats.todo.color} />
            {!isSmall && <Text style={textStyle}>To Do</Text>}
          </div>
        </Card>
      </Col>
      <Col xs={6}>
        <Card bodyStyle={cardStyle}>
          <Text style={numberStyle}>{stats.inProgress.total || 0}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconProgress size={iconSize} color={stats.inProgress.color} />
            {!isSmall && <Text style={textStyle}>In Progress</Text>}
          </div>
        </Card>
      </Col>
      <Col xs={6}>
        <Card bodyStyle={cardStyle}>
          <Text style={numberStyle}>{stats.complete.total || 0}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconCircleCheckFilled size={iconSize} color={stats.complete.color} />
            {!isSmall && <Text style={textStyle}>Complete</Text>}
          </div>
        </Card>
      </Col>
      <Col xs={6}>
        <Card bodyStyle={cardStyle}>
          <Text style={numberStyle}>{stats.overdue.total || 0}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconCircleXFilled size={iconSize} color={stats.overdue.color} />
            {!isSmall && <Text style={textStyle}>Overdue</Text>}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Overview;
