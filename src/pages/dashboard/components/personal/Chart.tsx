import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import { Select } from 'antd';
import React, { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartPeriod = 'week' | 'month' | 'quarter';

export const Chart: React.FC = () => {
  const [period, setPeriod] = React.useState<ChartPeriod>('week');
  const { currentWorkspace } = useWorkspaces();
  const { user: identity } = useAuth();

  // Lấy tasks của user hiện tại
  const { data: tasksData, isLoading } = useList({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: [
      { field: 'workspaceId', operator: 'eq', value: currentWorkspace?.id },
      { field: 'assigneeId', operator: 'eq', value: identity?.id },
    ],
    queryOptions: { enabled: !!currentWorkspace?.id && !!identity?.id },
  });

  // Tính toán dữ liệu chart theo period
  const chartData = useMemo(() => {
    if (!tasksData?.data) return [];

    const tasks = tasksData.data;
    const now = new Date();

    // Helper function: Lấy tuần trong năm
    const getWeek = (date: Date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Helper function: Format date
    const formatPeriod = (date: Date, type: ChartPeriod) => {
      if (type === 'week') {
        return `Tuần ${getWeek(date)}`;
      } else if (type === 'month') {
        return `Tháng ${date.getMonth() + 1}`;
      } else {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Quý ${quarter}`;
      }
    };

    // Lọc tasks đã hoàn thành
    const completedTasks = tasks.filter((task: any) => {
      const completeDate = task.completedAt || task.updatedAt;
      if (!completeDate) return false;

      // Kiểm tra trạng thái hoàn thành
      return task.status === 'done' || task.stageTitle === 'COMPLETE';
    });

    // Group by period
    const groupedData: { [key: string]: { completed: number; created: number } } = {};

    // Khởi tạo dữ liệu cho các period gần đây
    const periodsToShow = period === 'week' ? 8 : period === 'month' ? 6 : 4;

    for (let i = periodsToShow - 1; i >= 0; i--) {
      const date = new Date(now);

      if (period === 'week') {
        date.setDate(date.getDate() - i * 7);
      } else if (period === 'month') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setMonth(date.getMonth() - i * 3);
      }

      const key = formatPeriod(date, period);
      groupedData[key] = { completed: 0, created: 0 };
    }

    // Đếm tasks hoàn thành theo period
    completedTasks.forEach((task: any) => {
      const completeDate = new Date(task.completedAt || task.updatedAt);
      const key = formatPeriod(completeDate, period);

      if (groupedData[key]) {
        groupedData[key].completed += 1;
      }
    });

    // Đếm tasks được tạo theo period (optional - để so sánh)
    tasks.forEach((task: any) => {
      if (!task.createdAt) return;
      const createDate = new Date(task.createdAt);
      const key = formatPeriod(createDate, period);

      if (groupedData[key]) {
        groupedData[key].created += 1;
      }
    });

    // Convert to array
    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      completed: data.completed,
      created: data.created,
    }));
  }, [tasksData, period]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <Select
          value={period}
          onChange={value => setPeriod(value as ChartPeriod)}
          style={{ width: 120 }}
          size="small"
          options={[
            { value: 'week', label: 'Theo tuần' },
            { value: 'month', label: 'Theo tháng' },
            { value: 'quarter', label: 'Theo quý' },
          ]}
        />
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" barSize={40} fill="#52c41a" name="Hoàn thành" />
          <Line type="monotone" dataKey="completed" stroke="#ff7300" name="Xu hướng" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
