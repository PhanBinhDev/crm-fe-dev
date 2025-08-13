import { Card, Skeleton, Row, Col } from 'antd';

export const UserInfoSkeleton = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton.Button active size="default" style={{ width: 150 }} />
        <Skeleton.Button active size="default" style={{ width: 100 }} />
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card Skeleton */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              textAlign: 'center',
              height: '100%',
              background: '#fafafa',
              borderRadius: 8,
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <Skeleton.Avatar active size={120} style={{ marginBottom: 24 }} />
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
            <div style={{ marginTop: 16 }}>
              <Skeleton.Button active size="small" style={{ width: 80, marginBottom: 8 }} />
              <br />
              <Skeleton.Button active size="small" style={{ width: 100 }} />
            </div>
          </Card>
        </Col>

        {/* Details Card Skeleton */}
        <Col xs={24} lg={16}>
          <Card
            title={<Skeleton.Input active size="small" style={{ width: 200 }} />}
            style={{ height: '100%', borderRadius: 8 }}
            styles={{ body: { padding: '24px 32px' } }}
          >
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
      </Row>

      {/* Activities Section Skeleton */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 300 }} />}
        style={{ marginTop: 24, borderRadius: 8 }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </div>
  );
};
