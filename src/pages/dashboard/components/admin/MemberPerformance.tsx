// components/MemberPerformance.tsx
import Spinner from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { UserOutlined } from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { Avatar, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface MemberPerformanceData {
  key: string;
  memberId: string;
  name: string;
  email: string;
  avatar?: string;
  active: number;
  overdue: number;
  completed: number;
  total: number;
  progress: number;
}

const MemberPerformance: React.FC = () => {
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
  console.log('member', members);

  // Tính toán performance cho mỗi member
  const tableData: MemberPerformanceData[] = members.map((member: any) => {
    const memberTasks = tasks.filter((task: any) => task.assignees.id === member.userId);

    const completed = memberTasks.filter((t: any) => t.stage.stageGroup === 'done').length;
    const active = memberTasks.filter(
      (t: any) => t.stage.stageGroup !== 'done' && t.stage.stageGroup !== 'cancelled',
    ).length;
    const overdue = memberTasks.filter((t: any) => {
      if (!t.endTime) return false;
      return new Date(t.endTime) < new Date() && t.stage.stageGroup !== 'done';
    }).length;

    const total = memberTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      key: member.id,
      memberId: member.userId,
      name: member.user?.name || 'Chưa có tên',
      email: member.user?.email || '',
      avatar: member.user?.avatar,
      active,
      overdue,
      completed,
      total,
      progress,
    };
  });

  const columns: ColumnsType<MemberPerformanceData> = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'stt',
      align: 'center',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MemberPerformanceData) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} size="small">
            {!record.avatar && name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div>{name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      title: 'Đang làm',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (value: number) => <Tag color="blue">{value}</Tag>,
      sorter: (a, b) => a.active - b.active,
    },
    {
      title: 'Trễ hạn',
      dataIndex: 'overdue',
      key: 'overdue',
      align: 'center',
      render: (value: number) => <Tag color={value > 0 ? 'red' : 'default'}>{value}</Tag>,
      sorter: (a, b) => a.overdue - b.overdue,
    },
    {
      title: 'Đã huỷ',
      dataIndex: 'completed',
      key: 'completed',
      align: 'center',
      render: (value: number) => <Tag color="red">{value}</Tag>,
      sorter: (a, b) => a.completed - b.completed,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completed',
      key: 'completed',
      align: 'center',
      render: (value: number) => <Tag color="green">{value}</Tag>,
      sorter: (a, b) => a.completed - b.completed,
    },
    {
      title: 'Tổng công việc',
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      sorter: (a, b) => a.total - b.total,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: total => `Tổng ${total} thành viên`,
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default MemberPerformance;
