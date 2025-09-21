import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
  IconProgress,
} from '@tabler/icons-react';
import { Card, Col, Row, Typography } from 'antd';
const { Text } = Typography;

const Overview = () => {
  const stats = {
    todo: 100,
    inProgress: 50,
    complete: 30,
    overdue: 2000,
  };
  return (
    <>
      <Row gutter={[16, 16]} style={{ height: 200 }}>
        <Col span={12}>
          <Card
            bodyStyle={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 8 }}>
              <IconCircleDashed size={17} />
              <Text style={{ fontSize: 17 }}>To Do </Text>
            </div>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>{stats.todo || 0}</Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            bodyStyle={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 8 }}>
              <IconProgress size={17} />
              <Text style={{ fontSize: 17 }}>In Progress </Text>
            </div>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>{stats.inProgress || 0}</Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            bodyStyle={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 8 }}>
              <IconCircleCheckFilled size={17} />
              <Text style={{ fontSize: 17 }}>Complete </Text>
            </div>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>{stats.complete || 0}</Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            bodyStyle={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 8 }}>
              <IconCircleXFilled size={17} />
              <Text style={{ fontSize: 17 }}>Overdue </Text>
            </div>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>{stats.overdue || 0}</Text>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Overview;
