import { IStage } from '@/common/types';
import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
  IconProgress,
} from '@tabler/icons-react';
import { Card, Col, Grid, Progress, Row, Typography } from 'antd';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface OverviewProps {
  stage: IStage[];
}

const Overview = ({ stage }: OverviewProps) => {
  const screens = useBreakpoint();
  const isSmall = !screens.md;

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

  const stats = {
    todo: { total: 0, color: stage.find(s => s.title === 'TO DO')?.color || 'gray' },
    inProgress: { total: 0, color: stage.find(s => s.title === 'IN PROGRESS')?.color || 'gray' },
    complete: { total: 1000, color: stage.find(s => s.title === 'COMPLETE')?.color || 'gray' },
    overdue: { total: 100, color: stage.find(s => s.title === 'OVERDUE')?.color || 'gray' },
  };
  const overal =
    (stats.todo.total || 0) +
    (stats.inProgress.total || 0) +
    (stats.complete.total || 0) +
    (stats.overdue.total || 0);

  const percent = overal > 0 ? (stats.complete.total / overal) * 100 : 0;

  return (
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
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
