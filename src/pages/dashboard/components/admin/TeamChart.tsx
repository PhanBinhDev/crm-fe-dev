// components/TeamChart.tsx
import Spinner from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TeamChart: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();

  // Lấy danh sách members
  const { data: membersData, isLoading: membersLoading } = useList({
    resource: `workspaces/${currentWorkspace?.id}/members`,
    pagination: { mode: 'off' },
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  // Lấy tất cả tasks
  const { data: tasksData, isLoading: tasksLoading } = useList({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: [{ field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id }],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  if (membersLoading || tasksLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spinner />
      </div>
    );
  }

  const members = membersData?.data || [];
  const tasks = tasksData?.data || [];

  // Tính toán số lượng task theo member
  const chartData = members.map((member: any) => {
    const memberTasks = tasks.filter((task: any) => task.assigneeId === member.userId);

    const completed = memberTasks.filter((t: any) => t.status === 'done').length;
    const active = memberTasks.filter(
      (t: any) => t.status !== 'done' && t.status !== 'cancelled',
    ).length;
    const overdue = memberTasks.filter((t: any) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    }).length;

    return {
      name: member.user?.name || member.user?.email?.split('@')[0] || 'Unknown',
      'Hoàn thành': completed,
      'Đang làm': active,
      'Trễ hạn': overdue,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={chartData} style={{ marginLeft: -25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Hoàn thành" fill="#52c41a" />
        <Bar dataKey="Đang làm" fill="#1890ff" />
        <Bar dataKey="Trễ hạn" fill="#ff4d4f" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TeamChart;
