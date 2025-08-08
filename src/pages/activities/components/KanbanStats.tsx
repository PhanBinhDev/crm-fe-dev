import React from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

interface Activity {
  id: string;
  name: string;
  status: 'new' | 'in_progress' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface KanbanStatsProps {
  activities: Activity[];
}

export const KanbanStats: React.FC<KanbanStatsProps> = ({ activities }) => {
  const stats = {
    total: activities.length,
    new: activities.filter(a => a.status === 'new').length,
    inProgress: activities.filter(a => a.status === 'in_progress').length,
    completed: activities.filter(a => a.status === 'completed').length,
    overdue: activities.filter(a => a.status === 'overdue').length,
    high: activities.filter(a => a.priority === 'high' || a.priority === 'urgent').length,
  };

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="Tổng nhiệm vụ"
            value={stats.total}
            prefix={<PlusCircleOutlined style={{ color: '#1890ff' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Mới"
            value={stats.new}
            prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Đang thực hiện"
            value={stats.inProgress}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Hoàn thành"
            value={stats.completed}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Quá hạn"
            value={stats.overdue}
            prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Ưu tiên cao"
            value={stats.high}
            prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};
